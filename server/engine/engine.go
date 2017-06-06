package engine

import (
	"fmt"

	"errors"

	log "github.com/Sirupsen/logrus"
	"github.com/looplab/fsm"
	"github.com/orcaman/concurrent-map"
	uuid "github.com/satori/go.uuid"
)

// A concurrent map containing running engines, i.e. the ones that are currently in a transition
// key: unique id of the deployable entity
// value: simple bool
var runningEngines = cmap.New()

// CallbackEvent represents a callback of an event
type CallbackEvent interface {
	Name() string
}

func before(c CallbackEvent) string {
	return "before_" + c.Name()
}

func after(c CallbackEvent) string {
	return "after_" + c.Name()
}

// DeployableEntity is something that can deployed by Docktor
// For example a container, a stack and so on.
type DeployableEntity interface {
	// GetInitialState returns the current state of the given entity. The engine needs this to know what is the initial state of the deployement
	GetInitialState() State
	// ID returns the unique ID of the deployable entity
	ID() string
	// Name returns a name
	Name() string
	// Install will install the entity (e.g. container)
	// State is the previous state, needed because all the actions needed to perform the transition may depend on the current state
	Install(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error)
	// Start will start the entity (e.g. container)
	// State is the previous state, needed because all the actions needed to perform the transition may depend on the current state
	Start(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error)
	// StoreMessage store the log in database
	StoreMessage(message NotificationMessage) error
}

// Abortable is channel handling aborting things
type Abortable chan struct{}

// Abort sends an abort signal. This signal has to be consumed for this function to return
func (a Abortable) Abort() {
	a <- struct{}{}
}

// Context is the context used in an Docktor engine
type Context struct {
	id               uuid.UUID        // Unique ID of the engine
	deployableEntity DeployableEntity // Can be a container, a stack and so on. It contains data needed to deploy it
	abortEngine      Abortable        // Channel used to handle abort. One message on this channel will abort the current transition
	notifBus         NotificationBus  // A notification bus. Every transition will eventually push messages in this channel
}

func (ec Context) String() string {
	return fmt.Sprintf("{ id:%s entity_id:%v entity_name:%v }", ec.id, ec.deployableEntity.ID(), ec.deployableEntity.Name())
}

// Engine defines the final state machine used to deploy entity like containers, stacks and so on.
// It contains all possible transition from state to state and manages
type Engine struct {
	Context
	stateMachine *fsm.FSM
}

// NewEngine creates a new engine to manage transitions of a deployable entity
// A deployable entity is something that can be deployed/stop/start, like a container or a stack
// It manages the lifecycle with transition that can be run with the Run function
func NewEngine(deployableEntity DeployableEntity, notifBus NotificationBus) *Engine {
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
				ctx.abortEngine = make(chan struct{})
				runningEngines.Set(ctx.deployableEntity.ID(), ctx.id.String())
			},
			"after_event": func(e *fsm.Event) {
				// After every event
				ctx, err := getEventContext(e)
				if err != nil {
					e.Err = err
					return
				}
				if ctx.abortEngine != nil {
					close(ctx.abortEngine) // Release resources if transition completes without a cancel
				}
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
				err = start(e, ctx)
				if err != nil {
					e.Err = err
					return
				}
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
		Context: Context{
			id:               uuid.NewV4(),
			deployableEntity: deployableEntity,
			notifBus:         notifBus,
		},
	}
}

// getEventContext get the typed engine context from untyped one
func getEventContext(e *fsm.Event) (*Context, error) {

	if e == nil {
		return nil, errors.New("Unable to get engine context from event because event is nil")
	}

	if len(e.Args) == 0 {
		return nil, errors.New("Unable to get engine context from event because no event arguments has been found")
	}

	return getContext(e.Args[0])
}

// getContext returns the interface as *EngineContext
// Returns error if interface is not of the right type
func getContext(c interface{}) (*Context, error) {
	ctx, ok := c.(*Context)
	if !ok {
		return nil, fmt.Errorf("Unable to get engine context because it's not of right type. Expected *engine.EngineContext, obtained %T", c)
	}
	return ctx, nil
}

// Run launches the given transition on state machine for a given deployable entity.
func (e *Engine) Run(transition Transition) error {
	if e.notifBus == nil {
		return errors.New("Notification bus should exist in engine context")
	}
	if _, ok := runningEngines.Get(e.deployableEntity.ID()); ok {
		return fmt.Errorf("Unable to make transition because another one is already running for given deployable entity")
	}

	// Send event on state machine
	return e.stateMachine.Event(transition.Name(), &e.Context)
}

// CurrentState gets the current state of the machine
func (e *Engine) CurrentState() (State, error) {
	return getState(e.stateMachine.Current())
}

// Cancel cancels transition
func (e *Engine) Cancel() {
	defer func() {
		if r := recover(); r != nil {
			log.Errorf("Transition is already finished: %v", r)
		}
	}()
	if e.abortEngine != nil {
		// Send signal to engine that the transition has to cancel
		e.abortEngine.Abort()
	}
}
