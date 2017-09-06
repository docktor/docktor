package engine

import "testing"
import . "github.com/smartystreets/goconvey/convey"

func TestGetState(t *testing.T) {
	Convey("On a Docktor engine", t, func() {
		Convey("Given an existing 'created' state as string'", func() {
			existing := "created"
			Convey("When I try to convert it as a real state", func() {
				state, err := getState(existing)
				Convey("Then I should get the real state 'created'", func() {
					So(err, ShouldBeNil)
					So(state, ShouldEqual, StateCreated)
				})
			})
		})
		Convey("Given an wrong state as string'", func() {
			wrong := "wrong-state"
			Convey("When I try to convert it as a real state", func() {
				_, err := getState(wrong)
				Convey("Then I should get an error", func() {
					So(err, ShouldNotBeNil)
				})
			})
		})
	})
}
