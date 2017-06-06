package engine

import (
	"fmt"

	log "github.com/Sirupsen/logrus"
	"github.com/looplab/fsm"
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

// doTransition runs the transition process with the chainer engine
// It handles asynchronous returns from chainer engine
func doTransition(ctx *Context, transitionEngine *ChainEngine, transitionCtx *ChainerContext) error {

	processing := Operation{
		Errors: make(chan error),
		Status: make(chan string),
	}
	rollback := Operation{
		Errors: make(chan error),
		Status: make(chan string),
	}
	done := make(chan bool)

	if transitionCtx.AbortEngine == nil {
		transitionCtx.AbortEngine = ctx.abortEngine
	}
	if transitionCtx.notifBus == nil {
		transitionCtx.notifBus = ctx.notifBus
	}
	transitionCtx.DeployableEntity = ctx.deployableEntity

	go transitionEngine.Run(ctx.deployableEntity.ID(), transitionCtx, processing, rollback, done)

	var gotRollbackErrors bool
	var firstProcessError error
	run := true
	for run {
		select {
		case <-done:
			run = false
		case message, ok := <-processing.Status:
			if ok {
				ctx.notifBus.Send(NotificationMessage{
					Level:   log.InfoLevel.String(),
					Message: message,
				}, ctx.deployableEntity)
			}
		case err, ok := <-processing.Errors:
			if ok {
				firstProcessError = err
				ctx.notifBus.Send(NotificationMessage{
					Level:   log.ErrorLevel.String(),
					Message: err.Error(),
				}, ctx.deployableEntity)
			}
		case message, ok := <-rollback.Status:
			if ok {
				ctx.notifBus.Send(NotificationMessage{
					Level:   log.WarnLevel.String(),
					Message: message,
				}, ctx.deployableEntity)
			}
		case err, ok := <-rollback.Errors:
			if ok {
				gotRollbackErrors = true
				ctx.notifBus.Send(NotificationMessage{
					Level:   log.WarnLevel.String(),
					Message: err.Error(),
				}, ctx.deployableEntity)
			}
		}
	}
	if firstProcessError != nil {
		if gotRollbackErrors {
			return fmt.Errorf("Error occured during transition (rollback has not ended correctly, though). Origin: %v", firstProcessError.Error())
		}
		return fmt.Errorf("Error occured during transition( rollback ended correctly). Origin: %v", firstProcessError.Error())
	}
	return nil
}

func install(e *fsm.Event, ctx *Context) error {
	previous, err := getState(e.Src)
	if err != nil {
		log.WithError(err).Error("Unable to get previous state")
	}
	engine, transitionContext, err := ctx.deployableEntity.Install(previous)
	if err != nil {
		return err
	}

	return doTransition(ctx, engine, transitionContext)
}

func uninstall(e *fsm.Event, ctx *Context) {
	// TODO switch on previous state
	log.WithField("ctx", ctx).Debug("docker stop")
	log.WithField("ctx", ctx).Debug("docker remove")
}

func reinstall(e *fsm.Event, ctx *Context) {
	// TODO switch on previous state
	log.WithField("ctx", ctx).Debug("docker stop")
	log.WithField("ctx", ctx).Debug("docker remove")
	log.WithField("ctx", ctx).Debug("docker pull")
	log.WithField("ctx", ctx).Debug("docker create")
	log.WithField("ctx", ctx).Debug("docker start")
}

func start(e *fsm.Event, ctx *Context) error {
	previous, err := getState(e.Src)
	if err != nil {
		log.WithError(err).Error("Unable to get previous state")
	}
	engine, transitionContext, err := ctx.deployableEntity.Start(previous)
	if err != nil {
		return err
	}
	if transitionContext.AbortEngine == nil {
		transitionContext.AbortEngine = ctx.abortEngine
	}

	return doTransition(ctx, engine, transitionContext)
}

func stop(e *fsm.Event, ctx *Context) {
	// TODO switch on previous state
	log.WithField("ctx", ctx).Debug("docker start")
}

func restart(e *fsm.Event, ctx *Context) {
	// TODO switch on previous state
	log.WithField("ctx", ctx).Debug("docker stop")
	log.WithField("ctx", ctx).Debug("docker start")
}

func remove(e *fsm.Event, ctx *Context) {
	// TODO switch on previous state
	log.WithField("ctx", ctx).Debug("delete on mongo")
}
