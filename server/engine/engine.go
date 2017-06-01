package engine

import (
	"context"
	"fmt"

	"errors"

	log "github.com/Sirupsen/logrus"
	"github.com/looplab/fsm"
	"github.com/orcaman/concurrent-map"
	uuid "github.com/satori/go.uuid"
)

type CallbackEvent interface {
	Name() string
}

func before(c CallbackEvent) string {
	return "before_" + c.Name()
}

func after(c CallbackEvent) string {
	return "after_" + c.Name()
}

type DeployableEntity interface {
	GetInitialState() State
	ID() string
	Name() string
	Install(cancellingContext context.Context) error
}

type EngineContext struct {
	id               uuid.UUID
	deployableEntity DeployableEntity // Can be a container, a stack and so on
	cancelling       struct {
		cancelTransition context.CancelFunc
		ctx              context.Context
	}
}

func (ec EngineContext) String() string {
	return fmt.Sprintf("{ id:%s entity_id:%v entity_name:%v }", ec.id, ec.deployableEntity.ID(), ec.deployableEntity.Name())
}

type Engine struct {
	EngineContext
	stateMachine *fsm.FSM
}

// A concurrent map containing running engines, i.e. the ones that are currently in a transition
// key: unique id of the deployable entity
// value: simple bool
var runningEngines = cmap.New()

// NewEngine creates a new engine to manage transitions of a deployable entity
// A deployable entity is something that can be deployed/stop/start, like a container or a stack
// It manages the lifecycle with transition that can be run with the Run function
func NewEngine(deployableEntity DeployableEntity) *Engine {
	stateMachine := fsm.NewFSM(
		deployableEntity.GetInitialState().Name(),
		fsm.Events{
			{
				Name: TransitionInstall.Name(),
				Src:  []string{StateInitial.Name(), StateCreated.Name(), StateStopped.Name(), StateStarted.Name()},
				Dst:  StateStarted.Name(),
			},
			{
				Name: TransitionUninstall.Name(),
				Src:  []string{StateCreated.Name(), StateStarted.Name(), StateStopped.Name()},
				Dst:  StateCreated.Name(),
			},
			{
				Name: TransitionReinstall.Name(),
				Src:  []string{StateInitial.Name(), StateCreated.Name(), StateStopped.Name(), StateStarted.Name()},
				Dst:  StateStarted.Name(),
			},
			{
				Name: TransitionStart.Name(),
				Src:  []string{StateStopped.Name(), StateStarted.Name()},
				Dst:  StateStarted.Name(),
			},
			{
				Name: TransitionStop.Name(),
				Src:  []string{StateStopped.Name(), StateStarted.Name()},
				Dst:  StateStopped.Name(),
			},
			{
				Name: TransitionRestart.Name(),
				Src:  []string{StateStopped.Name(), StateStarted.Name()},
				Dst:  StateStarted.Name(),
			},
			{
				Name: TransitionRemove.Name(),
				Src:  []string{StateInitial.Name(), StateCreated.Name(), StateStopped.Name(), StateStarted.Name()},
				Dst:  StateInitial.Name(),
			},
		},
		fsm.Callbacks{
			"enter_state": func(e *fsm.Event) {
				log.WithFields(log.Fields{
					"event":     e.Event,
					"old_state": e.Src,
					"new_state": e.Dst,
				}).Debug("Docktor Engine - entering state")
			},
			"before_event": func(e *fsm.Event) {
				// Before every event
				ctx, err := getEventContext(e)
				if err != nil {
					e.Err = err
					return
				}
				cancelCtx, cancel := context.WithCancel(context.Background())
				ctx.cancelling.ctx = cancelCtx
				ctx.cancelling.cancelTransition = cancel
				runningEngines.Set(ctx.deployableEntity.ID(), ctx.id.String())
			},
			"after_event": func(e *fsm.Event) {
				// After every event
				ctx, err := getEventContext(e)
				if err != nil {
					e.Err = err
					return
				}
				ctx.cancelling.cancelTransition() // Release resources if transition completes without a cancel
				runningEngines.Remove(ctx.deployableEntity.ID())
			},
			after(TransitionInstall): func(e *fsm.Event) {
				ctx, err := getEventContext(e)
				if err != nil {
					e.Err = err
					return
				}
				err = install(e, ctx)
				if err != nil {
					e.Err = err
					return
				}
			},
			after(TransitionUninstall): func(e *fsm.Event) {
				ctx, err := getEventContext(e)
				if err != nil {
					e.Err = err
					return
				}
				uninstall(e, ctx)
			},
			after(TransitionReinstall): func(e *fsm.Event) {
				ctx, err := getEventContext(e)
				if err != nil {
					e.Err = err
					return
				}
				reinstall(e, ctx)
			},
			after(TransitionStart): func(e *fsm.Event) {
				ctx, err := getEventContext(e)
				if err != nil {
					e.Err = err
					return
				}
				start(e, ctx)
			},
			after(TransitionStop): func(e *fsm.Event) {
				ctx, err := getEventContext(e)
				if err != nil {
					e.Err = err
					return
				}
				stop(e, ctx)
			},
			after(TransitionRestart): func(e *fsm.Event) {
				ctx, err := getEventContext(e)
				if err != nil {
					e.Err = err
					return
				}
				restart(e, ctx)
			},
			after(TransitionRemove): func(e *fsm.Event) {
				ctx, err := getEventContext(e)
				if err != nil {
					e.Err = err
					return
				}
				remove(e, ctx)
			},
		},
	)

	return &Engine{
		stateMachine: stateMachine,
		EngineContext: EngineContext{
			id:               uuid.NewV4(),
			deployableEntity: deployableEntity,
		},
	}
}

// getEventContext get the typed engine context from untyped one
func getEventContext(e *fsm.Event) (*EngineContext, error) {

	if e == nil {
		return nil, errors.New("Unable to get engine context from event because event is nil")
	}

	if len(e.Args) == 0 {
		return nil, errors.New("Unable to get engine context from event because no event arguments has been found")
	}

	return getContext(e.Args[0])
}

func getContext(c interface{}) (*EngineContext, error) {
	ctx, ok := c.(*EngineContext)
	if !ok {
		return nil, fmt.Errorf("Unable to get engine context because it's not of right type. Expected *engine.EngineContext, obtained %T", c)
	}
	return ctx, nil
}

// Run launches the given transition on state machine for a given deployable entity.
func (e *Engine) Run(transition Transition) error {
	if _, ok := runningEngines.Get(e.deployableEntity.ID()); ok {
		return fmt.Errorf("Unable to make transition because another one is already running for given deployable entity")
	}
	// Send event on state machine
	return e.stateMachine.Event(transition.Name(), &e.EngineContext)
}

// CurrentState gets the current state of the machine
func (e *Engine) CurrentState() (State, error) {
	return getState(e.stateMachine.Current())
}

// Cancel cancels transition
func (e *Engine) Cancel() {
	e.cancelling.cancelTransition()
}
