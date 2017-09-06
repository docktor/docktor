package types_test

import (
	"testing"
	"time"

	"github.com/soprasteria/docktor/server/types"

	. "github.com/smartystreets/goconvey/convey"
)

func TestServices(t *testing.T) {
	Convey("On Services types", t, func() {
		Convey("Given a list of images", func() {
			images := []types.Image{
				{
					Created: time.Date(2005, time.November, 10, 22, 0, 0, 0, time.UTC),
					Name:    "Image2005",
				},
				{
					Created: time.Date(2016, time.November, 10, 23, 0, 0, 0, time.UTC),
					Name:    "Image2016",
				},
				{
					Created: time.Date(2015, time.November, 10, 23, 0, 0, 0, time.UTC),
					Name:    "Image2015",
				},
				{
					Created: time.Date(2010, time.November, 10, 23, 0, 0, 0, time.UTC),
					Name:    "Image2010",
				},
			}
			service := types.Service{
				Images: images,
			}
			Convey("When I try to get the last image", func() {
				image, err := service.GetLatestImage()
				Convey("Then I should get the latest created", func() {
					So(err, ShouldBeNil)
					So(image.Name, ShouldEqual, "Image2016")
				})
			})
		})
	})
}
