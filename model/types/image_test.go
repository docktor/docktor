package types_test

import (
	"fmt"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/soprasteria/docktor/model/types"

	"gopkg.in/mgo.v2/bson"
)

func ExampleImage_EqualsInConf_withID() {
	i := types.Image{
		ID: bson.ObjectId("1"),
	}
	j := types.Image{
		ID: bson.ObjectId("1"),
	}
	fmt.Println(i.EqualsInConf(j))
	// Output: true
}

func ExampleImage_EqualsInConf() {
	i := types.Image{
		ID:         bson.ObjectId("1"),
		Name:       "temp",
		Variables:  types.Variables{},
		Ports:      types.Ports{},
		Volumes:    types.Volumes{},
		Parameters: types.Parameters{},
	}
	j := types.Image{
		ID:         bson.ObjectId("2"),
		Name:       "temp",
		Variables:  types.Variables{},
		Ports:      types.Ports{},
		Volumes:    types.Volumes{},
		Parameters: types.Parameters{},
	}
	fmt.Println(i.EqualsInConf(j))
	// Output: true
}

var _ = Describe("Image", func() {
	Context("Given two images", func() {
		var (
			firstImage  types.Image
			secondImage types.Image
		)
		Context("If images are equals", func() {
			BeforeEach(func() {
				firstImage = types.Image{
					ID:         bson.ObjectId("1"),
					Name:       "temp",
					Variables:  types.Variables{},
					Ports:      types.Ports{},
					Volumes:    types.Volumes{},
					Parameters: types.Parameters{},
				}
				secondImage = types.Image{
					ID:         bson.ObjectId("2"),
					Name:       "temp",
					Variables:  types.Variables{},
					Ports:      types.Ports{},
					Volumes:    types.Volumes{},
					Parameters: types.Parameters{},
				}
			})
			It("Then EqualsInConf should be true", func() {
				Expect(firstImage.EqualsInConf(secondImage)).Should(BeTrue())
			})
		})

		Context("If images are equals except from variables", func() {
			BeforeEach(func() {
				firstImage = types.Image{
					ID:   bson.ObjectId("1"),
					Name: "temp",
					Variables: types.Variables{
						{Name: "var"},
					},
					Ports:      types.Ports{},
					Volumes:    types.Volumes{},
					Parameters: types.Parameters{},
				}
				secondImage = types.Image{
					ID:   bson.ObjectId("2"),
					Name: "temp",
					Variables: types.Variables{
						{Name: "notthesame"}, // not the same variables
					},
					Ports:      types.Ports{},
					Volumes:    types.Volumes{},
					Parameters: types.Parameters{},
				}
			})
			It("Then EqualsInConf should be false", func() {
				Expect(firstImage.EqualsInConf(secondImage)).Should(BeFalse())
			})
		})

		Context("If images are equals except from ports", func() {
			BeforeEach(func() {
				firstImage = types.Image{
					ID:        bson.ObjectId("1"),
					Name:      "temp",
					Variables: types.Variables{},
					Ports: types.Ports{
						{Internal: 8080, Protocol: "tcp"},
					},
					Volumes:    types.Volumes{},
					Parameters: types.Parameters{},
				}
				secondImage = types.Image{
					ID:        bson.ObjectId("2"),
					Name:      "temp",
					Variables: types.Variables{},
					Ports: types.Ports{
						{Internal: 8080, Protocol: "tcp"},
						{Internal: 9090, Protocol: "tcp"},
					},
					Volumes:    types.Volumes{},
					Parameters: types.Parameters{},
				}
			})
			It("Then EqualsInConf should be false", func() {
				Expect(firstImage.EqualsInConf(secondImage)).Should(BeFalse())
			})
		})

		Context("If images are equals except from volumes", func() {
			BeforeEach(func() {
				firstImage = types.Image{
					ID:        bson.ObjectId("1"),
					Name:      "temp",
					Variables: types.Variables{},
					Ports:     types.Ports{},
					Volumes: types.Volumes{
						{Internal: "/tmp", External: "/external/tmp", Rights: "rw"},
						{Internal: "/data", External: "/external/data", Rights: "rw"},
					},
					Parameters: types.Parameters{},
				}
				secondImage = types.Image{
					ID:        bson.ObjectId("2"),
					Name:      "temp",
					Variables: types.Variables{},
					Ports:     types.Ports{},
					Volumes: types.Volumes{
						{Internal: "/tmp", External: "/external/tmp", Rights: "rw"},
					},
					Parameters: types.Parameters{},
				}
			})
			It("Then EqualsInConf should be false", func() {
				Expect(firstImage.EqualsInConf(secondImage)).Should(BeFalse())
			})
		})

		Context("If images are equals except from parameters", func() {
			BeforeEach(func() {
				firstImage = types.Image{
					ID:        bson.ObjectId("1"),
					Name:      "temp",
					Variables: types.Variables{},
					Ports:     types.Ports{},
					Volumes:   types.Volumes{},
					Parameters: types.Parameters{
						{Name: "name", Value: "value1", Description: "description"},
					},
				}
				secondImage = types.Image{
					ID:        bson.ObjectId("2"),
					Name:      "temp",
					Variables: types.Variables{},
					Ports:     types.Ports{},
					Volumes:   types.Volumes{},
					Parameters: types.Parameters{
						{Name: "name", Value: "value2", Description: "description"},
					},
				}
			})
			It("Then EqualsInConf should be false", func() {
				Expect(firstImage.EqualsInConf(secondImage)).Should(BeFalse())
			})
		})
	})
})
