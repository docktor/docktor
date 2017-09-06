package engine

import (
	"context"
	"fmt"
	"sync"
	"testing"
	"time"

	log "github.com/sirupsen/logrus"
	. "github.com/smartystreets/goconvey/convey"
)

type MockDeployableEntity struct {
	id               string
	name             string
	To               chan string // Channel used to synchronise behavior of two concurrent transitions
	From             chan string // Channel used to synchronise behavior of two concurrent transitions
	WaitingForCancel chan string
	WaitingALongTime bool
}

func NewMockDeployableEntity(name string) MockDeployableEntity {
	return MockDeployableEntity{
		id:   name,
		name: name,
	}
}

func NewMockConcurrentDeployableEntity(name string, to, from chan string) MockDeployableEntity {
	return MockDeployableEntity{
		id:   name,
		name: name,
		To:   to,
		From: from,
	}
}

func (mock MockDeployableEntity) GetInitialState() State {
	if mock.WaitingForCancel != nil {
		return StateStopped
	}
	if mock.WaitingALongTime {
		return StateStarted
	}
	return StateInitial
}

func (mock MockDeployableEntity) ID() string {
	return mock.id
}

func (mock MockDeployableEntity) Name() string {
	return mock.name
}

func (mock MockDeployableEntity) downStepOK(abortContext context.Context, ctx *ChainerContext) (string, error) {
	return "Rollback test OK", nil
}

func (mock MockDeployableEntity) upStep(abortContext context.Context, ctx *ChainerContext) (string, error) {
	if mock.To != nil {
		mock.To <- "Test is ready for a cancel"
	}

	if mock.From != nil {
		<-mock.From
	}

	return "Forward test OK", nil
}

func (mock MockDeployableEntity) upStepOK(abortContext context.Context, ctx *ChainerContext) (string, error) {
	return "Forward test OK", nil
}

func (mock MockDeployableEntity) upStepWaitingALongTime(abortContext context.Context, ctx *ChainerContext) (string, error) {
	do := func() channelResult {
		time.Sleep(1 * time.Minute)
		return channelResult{message: "Done"}
	}

	channel := make(chan channelResult, 1)
	go func() {
		channel <- do()
	}()

	select {
	case <-abortContext.Done():
		return "", fmt.Errorf("Down step cancelled")
	case res := <-channel:
		return res.message, nil
	}
}

func (mock MockDeployableEntity) upStepAbort(abortContext context.Context, ctx *ChainerContext) (string, error) {

	do := func() channelResult {
		mock.To <- "Test is ready for a cancel"
		<-mock.From
		return channelResult{message: "Done"}
	}

	channel := make(chan channelResult, 1)
	go func() {
		channel <- do()
	}()

	select {
	case <-abortContext.Done():
		mock.WaitingForCancel <- "Abort has been received"
		return "", fmt.Errorf("Down step cancelled")
	case res := <-channel:
		return res.message, nil
	}
}

func (mock MockDeployableEntity) Install(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error) {

	engine := NewChainEngine()
	context := &ChainerContext{
		Data: map[string]interface{}{},
	}
	engine.Add(
		mock.ID(),
		Step{Up: mock.upStepOK, Down: mock.downStepOK},
		Step{Up: mock.upStep, Down: mock.downStepOK},
	)

	return engine, context, nil
}

func (mock MockDeployableEntity) Uninstall(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error) {
	engine := NewChainEngine()
	context := &ChainerContext{
		Data: map[string]interface{}{},
	}
	engine.Add(
		mock.ID(),
		Step{Up: mock.upStepOK, Down: mock.downStepOK},
		Step{Up: mock.upStepOK, Down: mock.downStepOK},
	)

	return engine, context, nil
}

func (mock MockDeployableEntity) Start(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error) {
	engine := NewChainEngine()
	context := &ChainerContext{
		Data: map[string]interface{}{},
	}
	engine.Add(
		mock.ID(),
		Step{Up: mock.upStepOK, Down: mock.downStepOK},
		Step{Up: mock.upStepAbort, Down: mock.downStepOK},
		Step{Up: mock.upStepOK, Down: mock.downStepOK},
	)

	return engine, context, nil
}

func (mock MockDeployableEntity) Stop(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error) {
	engine := NewChainEngine()
	context := &ChainerContext{
		Data: map[string]interface{}{},
	}
	engine.Add(
		mock.ID(),
		Step{Up: mock.upStepOK, Down: mock.downStepOK},
		Step{Up: mock.upStepWaitingALongTime, Down: mock.downStepOK},
		Step{Up: mock.upStepOK, Down: mock.downStepOK},
	)

	return engine, context, nil
}

func (mock MockDeployableEntity) StoreMessage(message StepNotif) error {
	log.Infof("%+v", message.Message)
	return nil
}

func (mock MockDeployableEntity) Reinstall(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error) {
	return nil, nil, nil
}

func (mock MockDeployableEntity) Remove(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error) {
	return nil, nil, nil
}

func (mock MockDeployableEntity) Restart(previous State) (transitionEngine *ChainEngine, transitionCtx *ChainerContext, err error) {
	return nil, nil, nil
}

func TestEngineConcurrenceOnSameEntityWithSameTransition(t *testing.T) {
	var dummyTimeout time.Duration
	Convey("On a Docktor engine", t, func() {
		Convey("Given a running 'install' transition on a 'jekyll' deployable entity", func() {
			var to = make(chan string)
			defer close(to)
			var from = make(chan string)
			defer close(from)

			deployableEntity := NewMockConcurrentDeployableEntity("jekyll", to, from)

			var errFirstEngine, errSecondEngine error
			var nbUpOK, nbUpKO, nbDownOK, nbDownKO int
			var errors []StepNotif
			var wg sync.WaitGroup
			wg.Add(3)

			firstEngine := NewEngine(deployableEntity, dummyTimeout)
			var notifier = make(StepNotifier)
			go func() {
				// Install transition will synchronously send a message to second engine
				// Then waiting for a message result from second engine
				// When message arrives, the transition is done
				errFirstEngine = firstEngine.Run(TransitionInstall, notifier)
				wg.Done()
			}()
			go func() {
				nbUpOK, nbUpKO, nbDownOK, nbDownKO, errors = fetchNotifications(notifier)
				wg.Done()
			}()

			Convey("When I try to run the same 'install' transition on the same 'jekyll' entity, while it's still running", func() {

				newEngine := NewEngine(deployableEntity, dummyTimeout)
				go func() {
					<-to // Waiting for signal from firstEngine
					var notifier = make(StepNotifier)
					errSecondEngine = newEngine.Run(TransitionInstall, notifier)
					from <- "No error" // Send message to first engine to tell it to continue its transition
					wg.Done()
				}()
				wg.Wait()

				Convey("Then the second transition should not return in error because it's already running in the same kind of transition", func() {
					So(errSecondEngine, ShouldBeNil)
				})

				Convey("Then the fisrt transition should end OK", func() {
					So(errFirstEngine, ShouldBeNil)
					So(nbUpOK, ShouldEqual, 2)
					So(nbUpKO, ShouldEqual, 0)
					So(nbDownOK, ShouldEqual, 0)
					So(nbDownKO, ShouldEqual, 0)
					So(errors, ShouldHaveLength, 0)
					So(runningEngines.Items(), ShouldBeEmpty)
				})
			})
		})
	})
}

func TestEngineConcurrenceOnSameEntityDifferentTransition(t *testing.T) {
	var dummyTimeout time.Duration
	Convey("On a Docktor engine", t, func() {
		Convey("Given a running 'install' transition on a 'jekyll' deployable entity", func() {
			var to = make(chan string)
			defer close(to)
			var from = make(chan string)
			defer close(from)

			deployableEntity := NewMockConcurrentDeployableEntity("jekyll", to, from)

			var errFirstEngine, errSecondEngine error
			var wg sync.WaitGroup
			var firstNbUpOK, firstNbUpKO, firstNbDownOK, firstNbDownKO int
			var firstErrors []StepNotif
			wg.Add(4)

			firstEngine := NewEngine(deployableEntity, dummyTimeout)
			var firstNotifier = make(StepNotifier)
			go func() {
				// Install transition will synchronously send a message to second engine
				// Then waiting for a message result from second engine
				// When message arrives, the transition is done

				errFirstEngine = firstEngine.Run(TransitionInstall, firstNotifier)
				wg.Done()
			}()

			go func() {
				firstNbUpOK, firstNbUpKO, firstNbDownOK, firstNbDownKO, firstErrors = fetchNotifications(firstNotifier)
				wg.Done()
			}()

			Convey("When I try to run a 'Uninstall' transition on the same deployable entity, while it's still running", func() {

				var secondNotifier = make(StepNotifier)
				var secondNbUpOK, secondNbUpKO, secondNbDownOK, secondNbDownKO int
				var secondErrors []StepNotif
				secondEngine := NewEngine(deployableEntity, dummyTimeout)
				go func() {
					<-to // Waiting for signal from firstEngine
					errSecondEngine = secondEngine.Run(TransitionUninstall, secondNotifier)
					from <- "Should be error !" // Send message to first engine to tell it to continue its transition
					wg.Done()
				}()

				go func() {
					secondNbUpOK, secondNbUpKO, secondNbDownOK, secondNbDownKO, secondErrors = fetchNotifications(secondNotifier)
					wg.Done()
				}()
				wg.Wait()

				Convey("Then the second engine should get an error because a different kind of transition is still running", func() {
					So(errSecondEngine, ShouldNotBeNil) // The second engine transition starts while the first one is
					So(errSecondEngine.Error(), ShouldContainSubstring, "already running for given deployable entity")
					So(secondNbUpOK, ShouldEqual, 0)
					So(secondNbUpKO, ShouldEqual, 0)
					So(secondNbDownOK, ShouldEqual, 0)
					So(secondNbDownKO, ShouldEqual, 0)
					So(secondErrors, ShouldHaveLength, 0)
				})

				Convey("Then the first transition should end OK", func() {
					So(errFirstEngine, ShouldBeNil)
					So(runningEngines.Items(), ShouldBeEmpty)
					So(firstNbUpOK, ShouldEqual, 2)
					So(firstNbUpKO, ShouldEqual, 0)
					So(firstNbDownOK, ShouldEqual, 0)
					So(firstNbDownKO, ShouldEqual, 0)
					So(firstErrors, ShouldHaveLength, 0)
				})
			})
		})
	})
}

func TestEngineConcurrenceOnDifferentEntitySameTransition(t *testing.T) {
	var dummyTimeout time.Duration
	Convey("On a Docktor engine", t, func() {
		Convey("Given a running 'install' transition on a 'jekyll' deployable entity", func() {
			var to = make(chan string)
			defer close(to)
			var from = make(chan string)
			defer close(from)

			deployableEntity := NewMockConcurrentDeployableEntity("jekyll", to, from)

			var errFirstEngine, errSecondEngine error
			var firstNbUpOK, firstNbUpKO, firstNbDownOK, firstNbDownKO int
			var firstErrors []StepNotif
			var wg sync.WaitGroup
			wg.Add(4)

			firstEngine := NewEngine(deployableEntity, dummyTimeout)
			var firstNotifier = make(StepNotifier)
			go func() {
				// Install transition will synchronously send a message to second engine
				// Then waiting for a message result from second engine
				// When message arrives, the transition is done
				errFirstEngine = firstEngine.Run(TransitionInstall, firstNotifier)
				wg.Done()
			}()

			go func() {
				firstNbUpOK, firstNbUpKO, firstNbDownOK, firstNbDownKO, firstErrors = fetchNotifications(firstNotifier)
				wg.Done()
			}()

			Convey("When I try to run a 'install' transition on another deployable entity 'mr_hide', while it's still running", func() {

				secondDeployableEntity := NewMockDeployableEntity("mr_hide")
				var secondNotifier = make(StepNotifier)
				var secondNbUpOK, secondNbUpKO, secondNbDownOK, secondNbDownKO int
				var secondErrors []StepNotif
				newEngine := NewEngine(secondDeployableEntity, dummyTimeout)
				go func() {
					<-to // Waiting for signal from firstEngine
					errSecondEngine = newEngine.Run(TransitionInstall, secondNotifier)
					from <- "should have no error" // Send message to first engine to tell it to continue its transition
					wg.Done()
				}()

				go func() {
					secondNbUpOK, secondNbUpKO, secondNbDownOK, secondNbDownKO, secondErrors = fetchNotifications(secondNotifier)
					wg.Done()
				}()
				wg.Wait()

				Convey("Then the transition 'install' of 'jekyll' should end OK", func() {
					So(errFirstEngine, ShouldBeNil)
					So(firstNbUpOK, ShouldEqual, 2)
					So(firstNbUpKO, ShouldEqual, 0)
					So(firstNbDownOK, ShouldEqual, 0)
					So(firstNbDownKO, ShouldEqual, 0)
					So(firstErrors, ShouldHaveLength, 0)
				})

				Convey("Then the transition 'install' of 'mr_hyde' engine end OK", func() {
					So(errSecondEngine, ShouldBeNil) // The second engine transition starts while the first one is, buts it's not the same entity !
					So(secondNbUpOK, ShouldEqual, 2)
					So(secondNbUpKO, ShouldEqual, 0)
					So(secondNbDownOK, ShouldEqual, 0)
					So(secondNbDownKO, ShouldEqual, 0)
					So(secondErrors, ShouldHaveLength, 0)
				})

				Convey("Then there are no running transitions left", func() {
					So(runningEngines.Items(), ShouldBeEmpty)
				})
			})
		})
	})
}

func TestEngineCancellingRunningTransitions(t *testing.T) {
	var dummyTimeout time.Duration
	Convey("On a Docktor engine", t, func() {
		Convey("Given a running transition on a deployable entity", func() {
			var to = make(chan string)
			defer close(to)
			var from = make(chan string)
			defer close(from)

			deployableEntity := NewMockConcurrentDeployableEntity("test", to, from)
			deployableEntity.WaitingForCancel = make(chan string)

			var wg sync.WaitGroup
			var errEngine error
			var nbUpOK, nbUpKO, nbDownOK, nbDownKO int
			var errors []StepNotif
			wg.Add(3)

			engine := NewEngine(deployableEntity, dummyTimeout)
			var notifier = make(StepNotifier)
			go func() {
				// Install transition will synchronously send a message to second engine
				// Then waiting for a cancel event
				// When cancel arrives, the transition is done and should be in error
				errEngine = engine.Run(TransitionStart, notifier)
				wg.Done()
			}()

			go func() {
				nbUpOK, nbUpKO, nbDownOK, nbDownKO, errors = fetchNotifications(notifier)
				wg.Done()
			}()

			Convey("When I try to cancel the engine", func() {
				go func() {
					<-to // Waiting for signal to abort process
					engine.Cancel()
					<-deployableEntity.WaitingForCancel
					from <- "Continue!" // Send signal to abort process that it can continue
					wg.Done()
				}()
				wg.Wait()

				Convey("Then the transition should exit in cancelled error", func() {
					So(errEngine, ShouldNotBeNil)
					So(errEngine.Error(), ShouldContainSubstring, "Operation has been canceled")
					So(errEngine.Error(), ShouldContainSubstring, "Manual cancel by user") // The real reason
					So(nbUpOK, ShouldEqual, 1)
					So(nbUpKO, ShouldEqual, 1)
					So(nbDownOK, ShouldEqual, 1)
					So(nbDownKO, ShouldEqual, 0)
					So(errors, ShouldHaveLength, 1)
					So(errors[0].StepNumber, ShouldEqual, 2)
					So(errors[0].Error, ShouldNotBeNil)
					So(errors[0].Error.Error(), ShouldContainSubstring, "canceled")
				})

				Convey("Then all transitions should be done", func() {
					So(runningEngines.Items(), ShouldBeEmpty)
				})
			})
		})
	})
}

func TestEngineTimeoutRunningTransitions(t *testing.T) {
	Convey("On a Docktor engine", t, func() {
		Convey("Given a running transition on a deployable entity", func() {

			var notifier = make(StepNotifier)

			deployableEntity := NewMockDeployableEntity("test")
			deployableEntity.WaitingALongTime = true

			var nbUpOK, nbUpKO, nbDownOK, nbDownKO int
			var errors []StepNotif
			var errEngine error
			var wg sync.WaitGroup
			wg.Add(1)
			engine := NewEngine(deployableEntity, 100*time.Millisecond) // Timeout triggered at this duration
			go func() {
				errEngine = engine.Run(TransitionStop, notifier)
				wg.Done()
			}()

			nbUpOK, nbUpKO, nbDownOK, nbDownKO, errors = fetchNotifications(notifier)
			wg.Wait()

			Convey("When the transition is too long", func() {
				Convey("Then the transition should timeout", func() {
					So(errEngine, ShouldNotBeNil)
					So(errEngine.Error(), ShouldContainSubstring, "Transition has been canceled")
					So(errEngine.Error(), ShouldContainSubstring, "reached the timeout") // The real reason
					So(nbUpOK, ShouldEqual, 1)
					So(nbUpKO, ShouldEqual, 1)
					So(nbDownOK, ShouldEqual, 1)
					So(nbDownKO, ShouldEqual, 0)
					So(errors, ShouldHaveLength, 1)
					So(errors[0].StepNumber, ShouldEqual, 2)
					So(errors[0].Error, ShouldNotBeNil)
					So(errors[0].Error.Error(), ShouldContainSubstring, "canceled")
				})
			})
		})
	})
}
