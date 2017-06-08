package engine

import (
	_ "github.com/smartystreets/goconvey/convey"
)

/*
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

func (mock MockDeployableEntity) downStep(abortContext context.Context, ctx *ChainerContext) (string, error) {
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
		Step{Up: mock.upStepOK, Down: mock.downStep},
		Step{Up: mock.upStep, Down: mock.downStep},
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
		Step{Up: mock.upStepOK, Down: mock.downStep},
		Step{Up: mock.upStepAbort, Down: mock.downStep},
		Step{Up: mock.upStepOK, Down: mock.downStep},
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
		Step{Up: mock.upStepOK, Down: mock.downStep},
		Step{Up: mock.upStepWaitingALongTime, Down: mock.downStep},
		Step{Up: mock.upStepOK, Down: mock.downStep},
	)

	return engine, context, nil
}

func (mock MockDeployableEntity) StoreMessage(message NotificationMessage) error {
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

func TestEngineConcurrenceOnTransitions(t *testing.T) {
	var dummyTimeout time.Duration
	Convey("On a Docktor engine", t, func() {
		Convey("Given a running transition on a 'jekyll' deployable entity", func() {
			var (
				to     = make(chan string)
				from   = make(chan string)
				notifs = make(NotificationBus)
			)
			defer func() {
				close(to)
				close(from)
				close(notifs)
			}()

			go func() {
				for msg := range notifs {
					t.Log(msg)
				}
			}()
			deployableEntity := NewMockConcurrentDeployableEntity("jekyll", to, from)

			var errFirstEngine, errSecondEngine error

			var wg sync.WaitGroup
			wg.Add(2)

			firstEngine := NewEngine(deployableEntity, notifs, dummyTimeout)
			go func() {
				// Install transition will synchronously send a message to second engine
				// Then waiting for a message result from second engine
				// When message arrives, the transition is done

				errFirstEngine = firstEngine.Run(TransitionInstall)
				wg.Done()
			}()

			Convey("When I try to run a transition on the same deployable entity, while it's still running", func() {
				newEngine := NewEngine(deployableEntity, notifs, dummyTimeout)
				go func() {
					<-to // Waiting for signal from firstEngine
					errSecondEngine = newEngine.Run(TransitionInstall)
					from <- errSecondEngine.Error() // Send message to first engine to tell it to continue its transition
					wg.Done()
				}()
				wg.Wait()

				Convey("Then the first engine should not return any error", func() {
					So(errFirstEngine, ShouldBeNil)
				})

				Convey("Then the second engine should get an error", func() {
					So(errSecondEngine, ShouldNotBeNil) // The second engine transition starts while the first one is
					So(errSecondEngine.Error(), ShouldContainSubstring, "already running for given deployable entity")
				})

				Convey("Then all transitions should be done", func() {
					So(runningEngines.Items(), ShouldBeEmpty)
				})
			})

			Convey("When I try to run a transition on another deployable entity 'mr_hide', while it's still running", func() {
				secondDeployableEntity := NewMockDeployableEntity("mr_hide")
				newEngine := NewEngine(secondDeployableEntity, notifs, dummyTimeout)
				go func() {
					<-to // Waiting for signal from firstEngine
					errSecondEngine = newEngine.Run(TransitionInstall)
					from <- "should have no error" // Send message to first engine to tell it to continue its transition
					wg.Done()
				}()
				wg.Wait()

				Convey("Then the first engine should not return any error", func() {
					So(errFirstEngine, ShouldBeNil)
				})

				Convey("Then the second engine should not return any error", func() {
					So(errSecondEngine, ShouldBeNil) // The second engine transition starts while the first one is, buts it's not the same entity !
				})

				Convey("Then all transitions should be done", func() {
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
			var (
				to     = make(chan string)
				from   = make(chan string)
				notifs = make(NotificationBus)
			)
			defer func() {
				close(to)
				close(from)
				close(notifs)
			}()
			go func() {
				for msg := range notifs {
					t.Log(msg)
				}
			}()

			deployableEntity := NewMockConcurrentDeployableEntity("test", to, from)
			deployableEntity.WaitingForCancel = make(chan string)

			var wg sync.WaitGroup
			var errEngine error
			wg.Add(2)

			engine := NewEngine(deployableEntity, notifs, dummyTimeout)
			go func() {
				// Install transition will synchronously send a message to second engine
				// Then waiting for a cancel event
				// When cancel arrives, the transition is done and should be in error
				errEngine = engine.Run(TransitionStart)
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
					So(errEngine.Error(), ShouldContainSubstring, "abort")
				})

				Convey("Then all transitions should be done", func() {
					So(runningEngines.Items(), ShouldBeEmpty)
				})
			})
		})
	})
}

func TestEngineTimeoutRunningTransitions(t *testing.T) {
	var dummyTimeout time.Duration
	Convey("On a Docktor engine", t, func() {
		Convey("Given a running transition on a deployable entity", func() {

			viper.Set("engine-transitiontimeout", "1s") // transition should timeout at 1s

			var (
				notifs = make(NotificationBus)
			)
			defer func() {
				close(notifs)
			}()
			go func() {
				for msg := range notifs {
					t.Log(msg)
				}
			}()

			deployableEntity := NewMockDeployableEntity("test")
			deployableEntity.WaitingALongTime = true

			engine := NewEngine(deployableEntity, notifs, dummyTimeout)
			errEngine := engine.Run(TransitionStop)

			Convey("When the transition is too long", func() {

				Convey("Then the transition should timeout", func() {
					So(errEngine, ShouldNotBeNil)
					So(errEngine.Error(), ShouldContainSubstring, "has reached the timeout")
				})
			})
		})
	})
}*/
