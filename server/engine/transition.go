package engine

import (
	"bytes"
	"fmt"
	"reflect"
	"runtime"
	"strings"

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

func doTransition(e *fsm.Event, ctx *Context, action func(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error)) error {
	previous, err := getState(e.Src)
	if err != nil {
		log.WithError(err).Error("Unable to get previous state")
	}
	engine, transitionContext, err := action(previous)
	if err != nil {
		return err
	}

	return handleTransitionResult(ctx, engine, transitionContext)
}

// handleTransitionResult runs the transition process with the chainer engine
// It handles asynchronous returns from chainer engine
func handleTransitionResult(ctx *Context, transitionEngine *ChainEngine, transitionCtx *ChainerContext) error { // nolint: gocyclo

	done := make(chan bool)

	if transitionCtx.Canceler == nil {
		transitionCtx.Canceler = ctx.canceler
	}

	transitionCtx.DeployableEntity = ctx.deployableEntity

	go transitionEngine.Run(ctx.deployableEntity.ID(), transitionCtx, ctx.notifier, done)

	firstNotifInError := StepNotif{}
	rollbackMessages := []StepNotif{}
	run := true
	for run {
		select {
		case <-done:
			run = false
		case message, ok := <-ctx.notifier:
			if !ok {
				break
			}
			if message.Error != nil {
				switch message.Type {
				case StepTypeProcess:
					firstNotifInError = message
				case StepTypeRewind:
					rollbackMessages = append(rollbackMessages, message)
				}
			}
		}
	}
	if firstNotifInError.Error != nil {
		if isCanceled(firstNotifInError.Error) {
			return fmt.Errorf(
				"Transition has been canceled while executing step %v (%v/%v) - %v",
				getFunctionName(firstNotifInError.Operate),
				firstNotifInError.StepNumber,
				firstNotifInError.TotalSteps,
				firstNotifInError.Error.Error(),
			)
		}

		if len(rollbackMessages) > 0 {
			var rollbackErrors bytes.Buffer
			for _, message := range rollbackMessages {
				rollbackErrors.WriteString(fmt.Sprintf("Rollback failed: step %v (%v/%v) - %v\n",
					getFunctionName(firstNotifInError.Operate),
					message.StepNumber,
					message.TotalSteps,
					message.Error.Error(),
				))
			}
			return fmt.Errorf(
				"Transition failed at step %v (%v/%v), but rollback was not OK though - %v. Rollback errors:\n%v",
				getFunctionName(firstNotifInError.Operate),
				firstNotifInError.StepNumber,
				firstNotifInError.TotalSteps,
				firstNotifInError.Error.Error(),
				rollbackErrors.String(),
			)
		}
		return fmt.Errorf("Transition failed at step %v (%v/%v) but rollback is OK - %v",
			getFunctionName(firstNotifInError.Operate),
			firstNotifInError.StepNumber,
			firstNotifInError.TotalSteps,
			firstNotifInError.Error.Error(),
		)
	}
	return nil
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
	//return doTransition(e, ctx, ctx.deployableEntity.Uninstall)
	return nil
}

func reinstall(e *fsm.Event, ctx *Context) error {
	//return doTransition(e, ctx, ctx.deployableEntity.Reinstall)
	return nil
}

func start(e *fsm.Event, ctx *Context) error {
	return doTransition(e, ctx, ctx.deployableEntity.Start)
}

func stop(e *fsm.Event, ctx *Context) error {
	return doTransition(e, ctx, ctx.deployableEntity.Stop)
}

func restart(e *fsm.Event, ctx *Context) error {
	//return doTransition(e, ctx, ctx.deployableEntity.Restart)
	return nil
}

func remove(e *fsm.Event, ctx *Context) error {
	//return doTransition(e, ctx, ctx.deployableEntity.Remove)
	return nil
}
