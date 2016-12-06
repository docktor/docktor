package types

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

// Daemon defines a server where services can be deployed
type Daemon struct {
	ID          bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Created     time.Time     `bson:"created" json:"created"`
	Name        string        `bson:"name" json:"name"`
	Protocol    string        `bson:"protocol" json:"protocol"`
	Host        string        `bson:"host" json:"host"`
	Port        int           `bson:"port" json:"port"`
	Timeout     int           `bson:"timeout" json:"timeout"`
	Ca          string        `bson:"ca,omitempty" json:"ca,omitempty"`
	Cert        string        `bson:"cert,omitempty" json:"cert,omitempty"`
	Key         string        `bson:"key,omitempty" json:"key,omitempty"`
	Volume      string        `bson:"volume,omitempty" json:"volume,omitempty"`
	Description string        `bson:"description,omitempty" json:"description,omitempty"`
	CAdvisorAPI string        `bson:"cadvisorApi,omitempty" json:"cadvisorApi,omitempty"`
	Site        bson.ObjectId `bson:"site" json:"site"`
	Variables   Variables     `bson:"variables" json:"variables"`
	Ports       Ports         `bson:"ports" json:"ports"`
	Volumes     Volumes       `bson:"volumes" json:"volumes"`
	Parameters  Parameters    `bson:"parameters" json:"parameters"`
	Tags        Tags          `bson:"tags" json:"tags"`
}

// AddVariable adds a Variable to the Daemon
func (d *Daemon) AddVariable(v Variable) {
	d.Variables = append(d.Variables, v)
}

// AddPort adds a Port to the Daemon
func (d *Daemon) AddPort(p Port) {
	d.Ports = append(d.Ports, p)
}

// AddVolume adds a Volume to the Daemon
func (d *Daemon) AddVolume(v Volume) {
	d.Volumes = append(d.Volumes, v)
}

// AddParameter adds a Parameter to the Daemon
func (d *Daemon) AddParameter(p Parameter) {
	d.Parameters = append(d.Parameters, p)
}
