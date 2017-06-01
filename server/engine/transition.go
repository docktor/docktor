package engine

import "github.com/looplab/fsm"
import log "github.com/Sirupsen/logrus"

type Transition string

func (t Transition) Name() string {
	return string(t)
}

const (
	TransitionInstall   Transition = "install"
	TransitionUninstall Transition = "uninstall"
	TransitionReinstall Transition = "reinstall"
	TransitionStart     Transition = "start"
	TransitionStop      Transition = "stop"
	TransitionRestart   Transition = "restart"
	TransitionRemove    Transition = "remove"
)

// TODO switch on previous state

func install(e *fsm.Event, ctx *EngineContext) error {

	previous, err := getState(e.Src)
	if err != nil {
		log.WithError(err).Error("Unable to get previous state")
	}
	switch previous {
	case StateInitial:
		log.WithField("ctx", ctx).Debug("Create in mongo")
		log.WithField("ctx", ctx).Debug("docker pull")
		log.WithField("ctx", ctx).Debug("docker create")
		log.WithField("ctx", ctx).Debug("docker start")
		log.WithField("ctx", ctx).Debug("health check")
	case StateCreated:
		log.WithField("ctx", ctx).Debug("docker pull")
		log.WithField("ctx", ctx).Debug("docker create")
		log.WithField("ctx", ctx).Debug("docker start")
		log.WithField("ctx", ctx).Debug("health check")
	case StateStopped:
		log.WithField("ctx", ctx).Debug("checking really stopped ?")
		log.WithField("ctx", ctx).Debug("docker start")
		log.WithField("ctx", ctx).Debug("health check")
	case StateStarted:
		log.WithField("ctx", ctx).Debug("checking really started ?")
		log.WithField("ctx", ctx).Debug("health check")
	default:
		log.Warn("Transition %v->%v with name %v is not handled", e.Src, e.Dst, e.Event)
	}
	return ctx.deployableEntity.Install(ctx.cancelling.ctx)
}

func uninstall(e *fsm.Event, ctx *EngineContext) {
	// TODO switch on previous state
	log.WithField("ctx", ctx).Debug("docker stop")
	log.WithField("ctx", ctx).Debug("docker remove")
}

func reinstall(e *fsm.Event, ctx *EngineContext) {
	// TODO switch on previous state
	log.WithField("ctx", ctx).Debug("docker stop")
	log.WithField("ctx", ctx).Debug("docker remove")
	log.WithField("ctx", ctx).Debug("docker pull")
	log.WithField("ctx", ctx).Debug("docker create")
	log.WithField("ctx", ctx).Debug("docker start")
}

func start(e *fsm.Event, ctx *EngineContext) {
	// TODO switch on previous state
	log.WithField("ctx", ctx).Debug("docker start")
}

func stop(e *fsm.Event, ctx *EngineContext) {
	// TODO switch on previous state
	log.WithField("ctx", ctx).Debug("docker start")
}

func restart(e *fsm.Event, ctx *EngineContext) {
	// TODO switch on previous state
	log.WithField("ctx", ctx).Debug("docker stop")
	log.WithField("ctx", ctx).Debug("docker start")
}

func remove(e *fsm.Event, ctx *EngineContext) {
	// TODO switch on previous state
	log.WithField("ctx", ctx).Debug("delete on mongo")
}
