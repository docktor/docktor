package types

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

// Command for images
type Command struct {
	ID      bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Name    string        `bson:"name" json:"name"`
	Exec    string        `bson:"exec" json:"exec"`
	Role    Role          `bson:"role" json:"role"` // user, admin
	Created time.Time     `bson:"created" json:"created"`
}

// Commands is a slice of Command
type Commands []Command
