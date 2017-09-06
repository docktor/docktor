package types

import (
	"errors"
	"fmt"
	"regexp"
	"time"

	"gopkg.in/mgo.v2/bson"
)

const (
	// HTTPProtocol is the protocol for reaching a daemon with HTTP
	HTTPProtocol DaemonProtocol = "http"
	// HTTPSProtocol is the protocol for reaching a daemon with HTTPS
	HTTPSProtocol DaemonProtocol = "https"

	daemonNamePattern = `^[a-zA-Z0-9_]{1,200}$`
)

// Daemon defines a server where services can be deployed
type Daemon struct {
	ID            bson.ObjectId   `bson:"_id,omitempty" json:"id,omitempty"`
	Active        bool            `bson:"active" json:"active"`
	Name          string          `bson:"name" json:"name" validate:"required"` // Unique in database
	Protocol      DaemonProtocol  `bson:"protocol" json:"protocol" validate:"required"`
	Host          string          `bson:"host" json:"host" validate:"required,hostname"`
	Port          int             `bson:"port" json:"port" validate:"required,gte=0,lte=65535"`
	Timeout       int             `bson:"timeout" json:"timeout" validate:"required,gt=0"` // Timeout in ms
	Ca            string          `bson:"ca,omitempty" json:"ca,omitempty"`
	Cert          string          `bson:"cert,omitempty" json:"cert,omitempty"`
	Key           string          `bson:"key,omitempty" json:"key,omitempty"`
	MountingPoint string          `bson:"mountingPoint" json:"mountingPoint" validate:"required"`
	Description   string          `bson:"description,omitempty" json:"description,omitempty"`
	CAdvisorAPI   string          `bson:"cadvisorApi,omitempty" json:"cadvisorApi,omitempty" validate:"omitempty,url"`
	Site          bson.ObjectId   `bson:"site" json:"site" validate:"required"`
	Variables     Variables       `bson:"variables" json:"variables"`
	Volumes       Volumes         `bson:"volumes" json:"volumes"`
	Tags          []bson.ObjectId `bson:"tags" json:"tags"`
	Created       time.Time       `bson:"created" json:"created"` // Fields that will be populated automatically by server
	Updated       time.Time       `bson:"updated" json:"updated"` // Fields that will be populated automatically by server
}

// DaemonProtocol is either HTTP or HTTPS
type DaemonProtocol string

// IsValid checks that the protocol is either HTTP or HTTPS
func (p DaemonProtocol) IsValid() bool {
	return p == HTTPProtocol || p == HTTPSProtocol
}

// AddVariable adds a Variable to the Daemon
func (d *Daemon) AddVariable(v Variable) {
	d.Variables = append(d.Variables, v)
}

// AddVolume adds a Volume to the Daemon
func (d *Daemon) AddVolume(v Volume) {
	d.Volumes = append(d.Volumes, v)
}

var daemonNameRegex = regexp.MustCompile(daemonNamePattern)

// Validate validates semantic of fields in daemon (like protocol type, pattern of the name and so on)
func (d Daemon) Validate() error {
	if !d.Protocol.IsValid() {
		return fmt.Errorf("Protocol obtained is %v, expected %v or %v", d.Protocol, HTTPProtocol, HTTPSProtocol)
	}

	if !daemonNameRegex.MatchString(d.Name) {
		return fmt.Errorf("Name %q does not match regex %q", d.Name, daemonNamePattern)
	}

	if d.Protocol == HTTPSProtocol {
		if d.Ca == "" || d.Cert == "" || d.Key == "" {
			return errors.New("Ca, Cert and Key are mandatory when using HTTPS protocol")
		}
	}

	if err := d.Variables.Validate(); err != nil {
		return err
	}

	if err := d.Volumes.Validate(); err != nil {
		return err
	}

	return nil
}

func DaemonsName(daemons []Daemon) []string {
	res := []string{}
	for _, d := range daemons {
		res = append(res, d.Name)
	}
	return res
}
