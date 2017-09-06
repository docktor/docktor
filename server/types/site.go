package types

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

// Site model
type Site struct {
	ID        bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Title     string        `bson:"title" json:"title" validate:"required"`
	Latitude  float64       `bson:"latitude" json:"latitude" validate:"required,gte=-90,lte=90"`
	Longitude float64       `bson:"longitude" json:"longitude" validate:"required,gte=-180,lte=180"`
	Created   time.Time     `bson:"created" json:"created"`
	Updated   time.Time     `bson:"updated" json:"updated"`
}
