package engine

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestEngineTransitions(t *testing.T) {
	Convey("On a Docktor engine", t, func() {
		deployableEntity := NewMockDeployableEntity("test")
		Convey("Given a deployable entity in 'initial state'", func() {
			engine := NewEngine(deployableEntity)
			Convey("When I try to run an 'install' transition", func() {
				err := engine.Run(TransitionInstall)
				Convey("Then I should be in a 'started' state", func() {
					So(err, ShouldBeNil)
					state, err := engine.CurrentState()
					So(err, ShouldBeNil)
					So(state, ShouldEqual, StateStarted)
				})
			})
		})
	})
}
