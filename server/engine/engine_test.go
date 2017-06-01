package engine

import (
	"context"
	"errors"
	"sync"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

type MockDeployableEntity struct {
	id               string
	name             string
	To               chan string // Channel used to synchronise behavior of two concurrent transitions
	From             chan string // Channel used to synchronise behavior of two concurrent transitions
	waitingForCancel bool
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
	return StateInitial
}

func (mock MockDeployableEntity) ID() string {
	return mock.id
}

func (mock MockDeployableEntity) Name() string {
	return mock.name
}

func (mock MockDeployableEntity) Install(cancellingContext context.Context) error {

	if mock.To != nil {
		mock.To <- "Go install !"
	}

	if mock.waitingForCancel {
		select {
		case <-cancellingContext.Done():
			mock.To <- "Cancelled"
			return errors.New("Transition has been cancelled")
		}
	}

	if mock.From != nil {
		<-mock.From
	}

	return nil
}

func TestEngineConcurrenceOnTransitions(t *testing.T) {
	Convey("On a Docktor engine", t, func() {

		Convey("Given a running transition on a 'jekyll' deployable entity", func() {

			var (
				to   = make(chan string)
				from = make(chan string)
			)
			deployableEntity := NewMockConcurrentDeployableEntity("jekyll", to, from)

			var errFirstEngine, errSecondEngine error

			var wg sync.WaitGroup
			wg.Add(2)

			firstEngine := NewEngine(deployableEntity)
			go func() {
				// Install transition will synchronously send a message to second engine
				// Then waiting for a message result from second engine
				// When message arrives, the transition is done
				errFirstEngine = firstEngine.Run(TransitionInstall)
				wg.Done()
			}()

			Convey("When I try to run a transition on the same deployable entity, while it's still running", func() {
				newEngine := NewEngine(deployableEntity)
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
				newEngine := NewEngine(secondDeployableEntity)
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
	Convey("On a Docktor engine", t, func() {
		Convey("Given a running transition on a deployable entity", func() {
			var (
				to   = make(chan string)
				from = make(chan string)
			)
			deployableEntity := NewMockConcurrentDeployableEntity("test", to, from)
			deployableEntity.waitingForCancel = true

			var wg sync.WaitGroup
			var errEngine error
			var cancelMessage string
			wg.Add(2)

			engine := NewEngine(deployableEntity)
			go func() {
				// Install transition will synchronously send a message to second engine
				// Then waiting for a cancel event
				// When cancel arrives, the transition is done and should be in error
				errEngine = engine.Run(TransitionInstall)
				wg.Done()
			}()

			Convey("When I try to cancel the engine", func() {
				go func() {
					<-to // Waiting for signal from engine telling transition is ready to be cancelled
					engine.Cancel()
					cancelMessage = <-to // Waiting for the cancel signal from engine
					close(from)
					wg.Done()
				}()
				wg.Wait()

				Convey("Then the cancel function should have been called", func() {
					So(cancelMessage, ShouldEqual, "Cancelled")
				})

				Convey("Then the transition should exit in cancelled error", func() {
					So(errEngine, ShouldNotBeNil)
					So(errEngine.Error(), ShouldEqual, "Transition has been cancelled")
				})

				Convey("Then all transitions should be done", func() {
					So(runningEngines.Items(), ShouldBeEmpty)
				})
			})
		})
	})
}
