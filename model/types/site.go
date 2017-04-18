package types

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

// Site model
type Site struct {
	ID        bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Created   time.Time     `bson:"created" json:"created"`
	Title     string        `bson:"title" json:"title"`
	Latitude  float64       `bson:"latitude" json:"latitude"`
	Longitude float64       `bson:"longitude" json:"longitude"`
}
