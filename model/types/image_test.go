package types

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"

	"gopkg.in/mgo.v2/bson"
)

func ExampleImageIdEquals() {
	i := Image{
		ID: bson.ObjectId("1"),
	}
	j := Image{
		ID: bson.ObjectId("1"),
	}
	fmt.Println(i.EqualsInConf(j))
	// Output: true
}

func ExampleImageEquals() {
	i := Image{
		ID:         bson.ObjectId("1"),
		Name:       "temp",
		Variables:  Variables{},
		Ports:      Ports{},
		Volumes:    Volumes{},
		Parameters: Parameters{},
	}
	j := Image{
		ID:         bson.ObjectId("2"),
		Name:       "temp",
		Variables:  Variables{},
		Ports:      Ports{},
		Volumes:    Volumes{},
		Parameters: Parameters{},
	}
	fmt.Println(i.EqualsInConf(j))
	// Output: true
}

func TestImageEquals(t *testing.T) {
	i := Image{
		ID:         bson.ObjectId("1"),
		Name:       "temp",
		Variables:  Variables{},
		Ports:      Ports{},
		Volumes:    Volumes{},
		Parameters: Parameters{},
	}
	j := Image{
		ID:         bson.ObjectId("2"),
		Name:       "temp",
		Variables:  Variables{},
		Ports:      Ports{},
		Volumes:    Volumes{},
		Parameters: Parameters{},
	}
	assert.True(t, i.EqualsInConf(j), "Images should be equals")
}

func TestImageNotEquals(t *testing.T) {
	i := Image{
		ID:   bson.ObjectId("1"),
		Name: "temp",
		Variables: Variables{
			{Name: "var"},
		},
		Ports:      Ports{},
		Volumes:    Volumes{},
		Parameters: Parameters{},
	}
	j := Image{
		ID:   bson.ObjectId("2"),
		Name: "temp",
		Variables: Variables{
			{Name: "notthesame"}, // not the same variables
		},
		Ports:      Ports{},
		Volumes:    Volumes{},
		Parameters: Parameters{},
	}
	assert.False(t, i.EqualsInConf(j), "Images should not be equals")
}

func TestImageAddedPortsEquals(t *testing.T) {
	i := Image{
		ID:        bson.ObjectId("1"),
		Name:      "temp",
		Variables: Variables{},
		Ports: Ports{
			{Internal: 8080, Protocol: "tcp"},
		},
		Volumes:    Volumes{},
		Parameters: Parameters{},
	}
	j := Image{
		ID:        bson.ObjectId("2"),
		Name:      "temp",
		Variables: Variables{},
		Ports: Ports{
			{Internal: 8080, Protocol: "tcp"},
			{Internal: 9090, Protocol: "tcp"},
		},
		Volumes:    Volumes{},
		Parameters: Parameters{},
	}
	assert.False(t, i.EqualsInConf(j), "Images should not be equals")
}

func TestImageRemovedVolumeEquals(t *testing.T) {
	i := Image{
		ID:        bson.ObjectId("1"),
		Name:      "temp",
		Variables: Variables{},
		Ports:     Ports{},
		Volumes: Volumes{
			{Internal: "/tmp", Value: "/external/tmp", Rights: "rw"},
			{Internal: "/data", Value: "/external/data", Rights: "rw"},
		},
		Parameters: Parameters{},
	}
	j := Image{
		ID:        bson.ObjectId("2"),
		Name:      "temp",
		Variables: Variables{},
		Ports:     Ports{},
		Volumes: Volumes{
			{Internal: "/tmp", Value: "/external/tmp", Rights: "rw"},
		},
		Parameters: Parameters{},
	}
	assert.False(t, i.EqualsInConf(j), "Images should not be equals")
}
