package types

import "gopkg.in/mgo.v2/bson"

// ExecutedJob is a job lunched for the container
type ExecutedJob struct {
	ID            bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Name          string        `bson:"name" json:"name"`
	JobID         bson.ObjectId `bson:"jobId" json:"jobId"`
	Description   string        `bson:"description" json:"description"`
	Result        string        `bson:"result" json:"result"`
	Status        string        `bson:"status" json:"status"`
	LastExecution string        `bson:"lastExecution" json:"lastExecution"`
}

// ExecutedJobs is a slice of jobs
type ExecutedJobs []ExecutedJob

// Container is a container associated to the group
type Container struct {
	ID           bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Name         string        `bson:"name" json:"name"`                             // Name of the container on the daemon
	Hostname     string        `bson:"hostname" json:"hostname"`                     // Hostname of the container on the daemon
	Image        string        `bson:"image" json:"image"`                           // Image identifies the version of the service
	ServiceTitle string        `bson:"serviceTitle" json:"serviceTitle"`             // Name of the service
	ServiceID    bson.ObjectId `bson:"serviceId" json:"serviceId"`                   // Id of the service
	ContainerID  string        `bson:"containerId" json:"containerId"`               // Full id of the container on the daemon
	Parameters   Parameters    `bson:"parameters" json:"parameters"`                 // Actual parameters used on the deployed container
	Ports        Ports         `bson:"ports" json:"ports"`                           // Actual bound ports on the deployed container
	Variables    Variables     `bson:"variables" json:"variables"`                   // Actual bound variables on the deployed container
	Volumes      Volumes       `bson:"volumes" json:"volumes"`                       // Actual volumes mapped on the deployed container
	ExecutedJobs ExecutedJobs  `bson:"jobs" json:"jobs"`                             // Results of jobs automatically executed on this kind of containers (like healthcheck)
	DaemonID     bson.ObjectId `bson:"daemonId,omitempty" json:"daemonId,omitempty"` // Id of the daemon where this container is deployed
	Active       bool          `bson:"active" json:"active"`                         // Is the container active or not
}

// Containers is a slice of Container
type Containers []Container

// AddParameter adds a ParameterContainer to the Container
func (c *Container) AddParameter(p Parameter) {
	c.Parameters = append(c.Parameters, p)
}

// AddPort adds a PortContainer to the Container
func (c *Container) AddPort(p Port) {
	c.Ports = append(c.Ports, p)
}

// AddVariable adds a VariableContainer to the Container
func (c *Container) AddVariable(v Variable) {
	c.Variables = append(c.Variables, v)
}

// AddVolume adds a VolumeContainer to the Container
func (c *Container) AddVolume(v Volume) {
	c.Volumes = append(c.Volumes, v)
}

// AddJob adds a JobContainer to the Container
func (c *Container) AddJob(j ExecutedJob) {
	c.ExecutedJobs = append(c.ExecutedJobs, j)
}
