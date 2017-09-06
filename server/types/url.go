package types

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

// URL for service
type URL struct {
	ID      bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Label   string        `bson:"label" json:"label"`
	URL     string        `bson:"url" json:"url"`
	Created time.Time     `bson:"created" json:"created"`
}

// URLs is a slice of URL
type URLs []URL
