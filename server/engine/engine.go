package engine

import (
	"fmt"
	"time"

	"errors"

	"github.com/looplab/fsm"
	"github.com/orcaman/concurrent-map"
	uuid "github.com/satori/go.uuid"
	log "github.com/sirupsen/logrus"
)

// Default timeout for a transition
const defaultTransitionTimeout = 2 * time.Hour

// A concurrent map containing running engines, i.e. the ones that are currently in a transition
// key: unique id of the deployable entity
// value: a transition
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
	// State is the previous state, needed because all the actions needed to perform the transition may depend on the previous state
	Install(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error)
	// Reinstall will remove and install the entity from scratch (e.g. container)
	// State is the previous state, needed because all the actions needed to perform the transition may depend on the previous state
	Reinstall(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error)
	// Start will start the entity (e.g. container)
	// State is the previous state, needed because all the actions needed to perform the transition may depend on the previous state
	Start(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error)
	// Restart will stop and start the entity (e.g. container)
	// State is the previous state, needed because all the actions needed to perform the transition may depend on the previous state
	Restart(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error)
	// Stop will stop the entity (e.g. container)
	// State is the previous state, needed because all the actions needed to perform the transition may depend on the previous state
	Stop(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error)
	// Uninstall will remove the entity from machine, but keep it in Docktor (e.g. container)
	// State is the previous state, needed because all the actions needed to perform the transition may depend on the previous state
	Uninstall(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error)
	// Remove will remove the entity from Docktor (e.g. container)
	// State is the previous state, needed because all the actions needed to perform the transition may depend on the previous state
	Remove(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error)
	// StoreMessage stores the log in database
	StoreMessage(notification StepNotif) error
}

// Cancelable is channel handling canceling things
type Cancelable chan string

// Cancel sends a cancel signal. This signal has to be consumed for this function to return
func (a Cancelable) Cancel(reason string) {
	a <- reason
}

// Context is the context used in an Docktor engine
type Context struct {
	id               uuid.UUID        // Unique ID of the engine
	deployableEntity DeployableEntity // Can be a container, a stack and so on. It contains data needed to deploy it
	canceler         Cancelable       // Channel used to handle canceling the transition. One message on this channel will trigger rollback of the current transition
	StepNotifier     StepNotifier
}

func (ec Context) String() string {
	return fmt.Sprintf("{ id:%s entity_id:%v entity_name:%v }", ec.id, ec.deployableEntity.ID(), ec.deployableEntity.Name())
}

// Engine defines the final state machine used to deploy entity like containers, stacks and so on.
// It contains all possible transition from state to state and manages
type Engine struct {
	Context
	stateMachine      *fsm.FSM
	transitionTimeout time.Duration
}

// Events defines all possible transitions for a deployable entity
var events = fsm.Events{
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
}

// callbacks defines handlers, called when arriving/leavin a state/transition
var callbacks = fsm.Callbacks{
	"enter_state": func(e *fsm.Event) {
		log.WithFields(log.Fields{
			"event":     e.Event,
			"old_state": e.Src,
			"new_state": e.Dst,
		}).Debug("Docktor Engine - entering state")
	},
	after(TransitionInstall): func(e *fsm.Event) {
		doAction(e, install)
	},
	after(TransitionUninstall): func(e *fsm.Event) {
		doAction(e, uninstall)
	},
	after(TransitionReinstall): func(e *fsm.Event) {
		doAction(e, reinstall)
	},
	after(TransitionStart): func(e *fsm.Event) {
		doAction(e, start)
	},
	after(TransitionStop): func(e *fsm.Event) {
		doAction(e, stop)
	},
	after(TransitionRestart): func(e *fsm.Event) {
		doAction(e, restart)
	},
	after(TransitionRemove): func(e *fsm.Event) {
		doAction(e, remove)
	},
}

// doAction runs the given action from an fsm event
func doAction(e *fsm.Event, action func(e *fsm.Event, ctx *Context) error) {
	// it wraps the cast of the context, stored in the event
	ctx, err := getEventContext(e)
	if err != nil {
		e.Err = err
		return
	}
	e.Err = action(e, ctx)
}

// NewEngine creates a new engine to manage transitions of a deployable entity
// A deployable entity is something that can be deployed/stop/start, like a container or a stack
// It manages the lifecycle with transition that can be run with the Run function
// timeout is a global timeout for transitions, canceling a running transition when reached
func NewEngine(deployableEntity DeployableEntity, timeout time.Duration) *Engine {

	stateMachine := fsm.NewFSM(deployableEntity.GetInitialState().Name(), events, callbacks)

	if timeout <= 0 {
		timeout = defaultTransitionTimeout
	}

	return &Engine{
		stateMachine: stateMachine,
		Context: Context{
			id:               uuid.NewV4(),
			deployableEntity: deployableEntity,
		},
		transitionTimeout: timeout,
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

	ctx, ok := e.Args[0].(*Context)
	if !ok {
		return nil, fmt.Errorf("Unable to get engine context because it's not of right type. Expected *engine.Context, obtained %T", e.Args[0])
	}

	return ctx, nil
}

// Run launches the given transition on state machine for a given deployable entity.
func (e *Engine) Run(transition Transition, notifier StepNotifier) error {
	if notifier == nil {
		return errors.New("Notifier is nil")
	}
	defer close(notifier)

	ch := make(chan error, 1)
	engineNotifs := make(StepNotifier)
	go func() {
		ch <- e.doRun(transition, engineNotifs)
	}()

	for notif := range engineNotifs {
		err := e.deployableEntity.StoreMessage(notif)
		if err != nil {
			log.WithField("id", e.deployableEntity.ID()).WithError(err).Error("Unable to store log for deployable entity")
		}
		notifier <- notif
	}

	return <-ch
}

func (e *Engine) doRun(transition Transition, notifier StepNotifier) error {
	if notifier == nil {
		return errors.New("notifier should not be nil")
	}
	if e.IsRunning() {
		close(notifier)
		if e.IsRunningInTransition(transition) {
			return nil // The engine is already running in same transition, so we do nothing for fault tolerance
		}
		return fmt.Errorf("Unable to make transition because another one is already running for given deployable entity")
	}
	e.Context.StepNotifier = notifier

	// Initialise the canceler for this transition
	e.canceler = make(chan string)
	defer close(e.canceler) // Release resources if transition completes without a cancel

	// Tells Docktor that this deployable entity is currently running in a transition
	runningEngines.Set(e.deployableEntity.ID(), transition)
	defer runningEngines.Remove(e.deployableEntity.ID())

	// Transition is automatically canceled when timeout has reached
	c := make(chan error, 1)
	go func() {
		c <- e.stateMachine.Event(transition.Name(), &e.Context)
	}()

	select {
	case <-time.After(e.transitionTimeout):
		// Sending the signal to engine that the transition has to stop
		e.canceler.Cancel(fmt.Sprintf("Reached timeout (%s)", e.transitionTimeout.String()))
		<-c
		return fmt.Errorf("Transition has been canceled because it has reached the timeout of %s", e.transitionTimeout.String())
	case err := <-c:
		return err
	}
}

// CurrentState gets the current state of the machine
func (e *Engine) CurrentState() (State, error) {
	return getState(e.stateMachine.Current())
}

// IsRunning returns true if the engine is currently in a transition
func (e *Engine) IsRunning() bool {
	_, ok := runningEngines.Get(e.deployableEntity.ID())
	return ok
}

// IsRunningInTransition returns true if the engine is currently running in given transition
func (e *Engine) IsRunningInTransition(transition Transition) bool {
	t, ok := runningEngines.Get(e.deployableEntity.ID())
	if !ok {
		return false // Engine is not running on given entity
	}
	runningTransition, ok := t.(Transition)
	if !ok {
		return false // Engine is running, but a wrong type was in cache
	}

	return runningTransition == transition
}

// Cancel cancels transition
func (e *Engine) Cancel() {
	if e.IsRunning() && e.canceler != nil {
		// Send signal to engine that the transition has to cancel
		e.canceler.Cancel("Manual cancel by user")
	}
}
