package engine

import (
	"context"
	"fmt"
	. "github.com/smartystreets/goconvey/convey"
	"sync"
	"testing"
	"time"
)

type MockTransitionDeployableEntity struct {
	id            string
	name          string
	notifications []StepNotif
}

func NewMockTransitionDeployableEntity(name string) MockTransitionDeployableEntity {
	return MockTransitionDeployableEntity{
		id:   name,
		name: name,
	}
}

func (mock *MockTransitionDeployableEntity) GetInitialState() State {
	return StateInitial
}

func (mock *MockTransitionDeployableEntity) ID() string {
	return mock.id
}

func (mock *MockTransitionDeployableEntity) Name() string {
	return mock.name
}

func (mock *MockTransitionDeployableEntity) Install(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error) {

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

func (mock *MockTransitionDeployableEntity) Start(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error) {
	return nil, nil, nil
}

func (mock *MockTransitionDeployableEntity) Stop(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error) {
	return nil, nil, nil
}

func (mock *MockTransitionDeployableEntity) Uninstall(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error) {
	return nil, nil, nil
}

func (mock *MockTransitionDeployableEntity) Reinstall(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error) {
	return nil, nil, nil
}

func (mock *MockTransitionDeployableEntity) Remove(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error) {
	return nil, nil, nil
}

func (mock *MockTransitionDeployableEntity) Restart(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error) {
	return nil, nil, nil
}

func (mock *MockTransitionDeployableEntity) StoreMessage(notification StepNotif) error {
	mock.notifications = append(mock.notifications, notification)
	return nil
}

func pullImage(cancelContext context.Context, ctx *ChainerContext) (string, error) {
	ctx.Notifier <- StepNotif{
		Type:    StepTypeProcess,
		Message: "docker pull begins...",
		Operate: pullImage,
		Status:  StepStatusInProgress,
	}

	return "docker pull done", nil
}

func createContainer(cancelContext context.Context, ctx *ChainerContext) (string, error) {
	ctx.Notifier <- StepNotif{
		Type:    StepTypeProcess,
		Message: "docker create begins...",
		Operate: createContainer,
		Status:  StepStatusInProgress,
	}
	return "docker create done", nil
}

func startContainer(cancelContext context.Context, ctx *ChainerContext) (string, error) {
	ctx.Notifier <- StepNotif{
		Type:    StepTypeProcess,
		Message: "docker start begins...",
		Operate: startContainer,
		Status:  StepStatusInProgress,
	}
	return "docker start done", nil
}

func removeImage(cancelContext context.Context, ctx *ChainerContext) (string, error) {
	ctx.Notifier <- StepNotif{
		Type:    StepTypeProcess,
		Message: "docker rmi begins...",
		Operate: removeImage,
		Status:  StepStatusInProgress,
	}
	return "docker rmi done", nil
}

func removeContainer(cancelContext context.Context, ctx *ChainerContext) (string, error) {
	ctx.Notifier <- StepNotif{
		Type:    StepTypeProcess,
		Message: "docker rm begins...",
		Operate: removeContainer,
		Status:  StepStatusInProgress,
	}
	return "docker rm done", nil
}

func stopContainer(cancelContext context.Context, ctx *ChainerContext) (string, error) {
	ctx.Notifier <- StepNotif{
		Type:    StepTypeProcess,
		Message: "docker stop begins...",
		Operate: stopContainer,
		Status:  StepStatusInProgress,
	}
	return "docker stop done", nil
}

func TestEngineTransitions(t *testing.T) {
	var dummyTimeout time.Duration
	Convey("On a Docktor engine", t, func() {
		var notifier = make(StepNotifier)
		var logs = []string{}
		var wg sync.WaitGroup
		wg.Add(1)
		go func() {
			// Get the notifications from the engine
			for msg := range notifier {
				t.Log(msg)
				logs = append(logs, msg.Message)
			}
			wg.Done()
		}()

		deployableEntity := NewMockTransitionDeployableEntity("test")
		Convey("Given a deployable entity in 'initial state'", func() {
			engine := NewEngine(&deployableEntity, dummyTimeout)
			Convey("When I try to run an 'install' transition", func() {
				err := engine.Run(TransitionInstall, notifier)
				wg.Wait()
				Convey("Then I should be in a 'started' state", func() {
					So(err, ShouldBeNil)
					state, err := engine.CurrentState()
					So(err, ShouldBeNil)
					So(state, ShouldEqual, StateStarted)
				})
				Convey("and notifications should contains logs from the steps", func() {
					So(logs, ShouldHaveLength, 6)
					So(logs[0], ShouldContainSubstring, "pull begins")
					So(logs[1], ShouldContainSubstring, "pull done")
					So(logs[2], ShouldContainSubstring, "create begins")
					So(logs[3], ShouldContainSubstring, "create done")
					So(logs[4], ShouldContainSubstring, "start begins")
					So(logs[5], ShouldContainSubstring, "start done")
				})
				Convey("and notifications should have been stored", func() {
					So(deployableEntity.notifications, ShouldHaveLength, 6)
					So(deployableEntity.notifications[0].Message, ShouldContainSubstring, "pull begins")
					So(deployableEntity.notifications[1].Message, ShouldContainSubstring, "pull done")
					So(deployableEntity.notifications[2].Message, ShouldContainSubstring, "create begins")
					So(deployableEntity.notifications[3].Message, ShouldContainSubstring, "create done")
					So(deployableEntity.notifications[4].Message, ShouldContainSubstring, "start begins")
					So(deployableEntity.notifications[5].Message, ShouldContainSubstring, "start done")
				})
			})
		})
	})
}
