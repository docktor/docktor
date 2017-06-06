package engine

import (
	"context"
	"fmt"
	"sync"
	"testing"

	log "github.com/sirupsen/logrus"
	. "github.com/smartystreets/goconvey/convey"
)

type MockTransitionDeployableEntity struct {
	id   string
	name string
}

func NewMockTransitionDeployableEntity(name string) MockTransitionDeployableEntity {
	return MockTransitionDeployableEntity{
		id:   name,
		name: name,
	}
}

func (mock MockTransitionDeployableEntity) GetInitialState() State {
	return StateInitial
}

func (mock MockTransitionDeployableEntity) ID() string {
	return mock.id
}

func (mock MockTransitionDeployableEntity) Name() string {
	return mock.name
}

func (mock MockTransitionDeployableEntity) Install(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error) {

	engine := NewChainEngine()
	context := &ChainerContext{
		Data: map[string]interface{}{},
	}
	steps := []Step{}
	switch previous {
	case StateInitial:
		steps = append(steps,
			Step{Up: pullImage, Down: removeImage},
			Step{Up: createContainer, Down: removeContainer},
			Step{Up: startContainer, Down: stopContainer},
		)
	case StateCreated:
		steps = append(steps,
			Step{Up: createContainer, Down: removeContainer},
			Step{Up: startContainer, Down: stopContainer},
		)
	case StateStopped:
		steps = append(steps,
			Step{Up: startContainer, Down: stopContainer},
		)
	case StateStarted:
		steps = append(steps,
			Step{Up: startContainer, Down: stopContainer},
		)
	default:
		return nil, nil, fmt.Errorf("Transition Install from %v state is not implemented", previous.Name())
	}

	engine.Add(mock.ID(), steps...)

	return engine, context, nil
}

func (mock MockTransitionDeployableEntity) Start(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error) {
	return nil, nil, nil
}

func (mock MockTransitionDeployableEntity) StoreMessage(message NotificationMessage) error {
	switch message.Level {
	case "info":
		log.Info(message.Message)
	case "warning":
		log.Warning(message.Message)
	case "error":
		log.Error(message.Message)
	}
	return nil
}

func pullImage(abortContext context.Context, ctx *ChainerContext) (string, error) {
	ctx.notifBus.Send(NotificationMessage{
		Level:   log.InfoLevel.String(),
		Message: stepSInfof(pullImage, processInProgress, "docker pull begins..."),
	}, ctx.DeployableEntity)

	return "docker image pulled", nil
}

func createContainer(abortContext context.Context, ctx *ChainerContext) (string, error) {
	ctx.notifBus.Send(NotificationMessage{
		Level:   log.InfoLevel.String(),
		Message: stepSInfof(createContainer, processInProgress, "docker create begins..."),
	}, ctx.DeployableEntity)
	return "docker create done", nil
}

func startContainer(abortContext context.Context, ctx *ChainerContext) (string, error) {
	ctx.notifBus.Send(NotificationMessage{
		Level:   log.InfoLevel.String(),
		Message: stepSInfof(startContainer, processInProgress, "docker start begins..."),
	}, ctx.DeployableEntity)
	return "docker start done", nil
}

func removeImage(abortContext context.Context, ctx *ChainerContext) (string, error) {
	ctx.notifBus.Send(NotificationMessage{
		Level:   log.InfoLevel.String(),
		Message: stepSInfof(removeImage, processInProgress, "docker rmi begins..."),
	}, ctx.DeployableEntity)
	return "docker rmi done", nil
}

func removeContainer(abortContext context.Context, ctx *ChainerContext) (string, error) {
	ctx.notifBus.Send(NotificationMessage{
		Level:   log.InfoLevel.String(),
		Message: stepSInfof(removeContainer, processInProgress, "docker remove begins..."),
	}, ctx.DeployableEntity)
	return "docker remove done", nil
}

func stopContainer(abortContext context.Context, ctx *ChainerContext) (string, error) {
	ctx.notifBus.Send(NotificationMessage{
		Level:   log.InfoLevel.String(),
		Message: stepSInfof(stopContainer, processInProgress, "docker stop begins..."),
	}, ctx.DeployableEntity)
	return "docker stop done", nil
}

func TestEngineTransitions(t *testing.T) {
	Convey("On a Docktor engine", t, func() {
		var notifs = make(NotificationBus)
		var logs = []string{}
		var wg sync.WaitGroup
		wg.Add(1)
		go func() {
			// Get the notifications from the engine
			for msg := range notifs {
				t.Log(msg)
				logs = append(logs, msg.Message)
			}
			wg.Done()
		}()

		deployableEntity := NewMockTransitionDeployableEntity("test")
		Convey("Given a deployable entity in 'initial state'", func() {
			engine := NewEngine(deployableEntity, notifs)
			Convey("When I try to run an 'install' transition", func() {
				err := engine.Run(TransitionInstall)
				close(notifs)
				wg.Wait()
				Convey("Then I should be in a 'started' state", func() {
					So(err, ShouldBeNil)
					state, err := engine.CurrentState()
					So(err, ShouldBeNil)
					So(state, ShouldEqual, StateStarted)
				})
				Convey("and notifications should contains logs from the steps", func() {
					So(logs, ShouldHaveLength, 6)
					So(logs[0], ShouldContainSubstring, "pull")
					So(logs[1], ShouldContainSubstring, "pull")
					So(logs[2], ShouldContainSubstring, "create")
					So(logs[3], ShouldContainSubstring, "create")
					So(logs[4], ShouldContainSubstring, "start")
					So(logs[5], ShouldContainSubstring, "start")
				})
			})
		})
	})
}
