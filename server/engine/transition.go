package engine

import (
	"reflect"
	"runtime"
	"strings"

	"github.com/looplab/fsm"
	log "github.com/sirupsen/logrus"
)

// Transition is the event that allows to go from a state to another by doing actions
// Actions are done, using a chainer engine, handling rollbacks
// It's used in the state machine handling lifecycle of a deployable entity
type Transition string

// Name returns the name of the transition
func (t Transition) Name() string {
	return string(t)
}

const (
	// TransitionInstall is the event to install a deployable entity (from scratch or from a stopped state)
	TransitionInstall Transition = "install"
	// TransitionUninstall is the event to delete the deployable entity from the machine but keeping its configuration on Docktor
	TransitionUninstall Transition = "uninstall"
	// TransitionReinstall is the event to delete and recreate from scratch the deployable entity
	TransitionReinstall Transition = "reinstall"
	// TransitionStart is the event to start a stopped deployable entity
	TransitionStart Transition = "start"
	// TransitionStop is the event to stop a deployable entity
	TransitionStop Transition = "stop"
	// TransitionRestart is the event to stop and restart a deployable entity
	TransitionRestart Transition = "restart"
	// TransitionRemove is the event to remove the deployable entity from machine and Docktor configuration
	TransitionRemove Transition = "remove"
)

func doTransition(e *fsm.Event, ctx *Context, action func(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error)) error {
	previous, err := getState(e.Src)
	if err != nil {
		log.WithError(err).Error("Unable to get previous state")
	}
	engine, transitionContext, err := action(previous)
	if err != nil {
		return err
	}
	if transitionContext.Canceler == nil {
		transitionContext.Canceler = ctx.canceler
	}

	return engine.Run(ctx.deployableEntity.ID(), transitionContext, ctx.StepNotifier)
}

// getFunctionName gets the function name
func getFunctionName(i interface{}) string {
	return runtime.FuncForPC(reflect.ValueOf(i).Pointer()).Name()
}

// getBaseNameFunction gets the function name, amputed from its path
func getBaseNameFunction(i interface{}) string {
	partOfFunction := strings.Split(getFunctionName(i), "/")
	var basename string
	if len(partOfFunction) > 0 {
		basename = partOfFunction[len(partOfFunction)-1]
		partOfFunction = strings.Split(basename, ")")
		if len(partOfFunction) > 0 {
			return partOfFunction[0]
		}
	}
	return ""
}

func install(e *fsm.Event, ctx *Context) error {
	return doTransition(e, ctx, ctx.deployableEntity.Install)
}

func uninstall(e *fsm.Event, ctx *Context) error {
	return doTransition(e, ctx, ctx.deployableEntity.Uninstall)
}

func reinstall(e *fsm.Event, ctx *Context) error {
	return doTransition(e, ctx, ctx.deployableEntity.Reinstall)
}

func start(e *fsm.Event, ctx *Context) error {
	return doTransition(e, ctx, ctx.deployableEntity.Start)
}

func stop(e *fsm.Event, ctx *Context) error {
	return doTransition(e, ctx, ctx.deployableEntity.Stop)
}

func restart(e *fsm.Event, ctx *Context) error {
	return doTransition(e, ctx, ctx.deployableEntity.Restart)
}

func remove(e *fsm.Event, ctx *Context) error {
	return doTransition(e, ctx, ctx.deployableEntity.Remove)
}
