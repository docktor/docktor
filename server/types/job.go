package types

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

// JobType is the type of the job, defining how status are fetch (with docker exec or via http call)
type JobType string

const (
	// ExecJob is a type where status is fetched with a "Docker exec" on the container
	ExecJob JobType = "exec"
	// HTTPJob is a type where status is fetched with an HTTP call.
	HTTPJob JobType = "url"
)

// Job for service
type Job struct {
	ID          bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Name        string        `bson:"name" json:"name"`
	Value       string        `bson:"value" json:"value"`       // ":port" if type = url, "unix command" if type= exec
	Interval    string        `bson:"interval" json:"interval"` // cron format
	Type        JobType       `bson:"type" json:"type"`
	Description string        `bson:"description" json:"description"`
	Active      bool          `bson:"active" json:"active"`
	Created     time.Time     `bson:"created" json:"created"`
}

// Jobs is a slice of Job
type Jobs []Job
