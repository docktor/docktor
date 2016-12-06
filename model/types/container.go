package types

import "gopkg.in/mgo.v2/bson"

// PortContainer defines a binding between an external and an internal port
type PortContainer struct {
	ID       bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Internal int           `bson:"internal" json:"internal"`
	External int           `bson:"external" json:"external"`
	Protocol string        `bson:"protocol" json:"protocol"`
}

// PortsContainer is a slice of PortContainer
type PortsContainer []PortContainer

// GetExternalPort search the external port bind to a given internalPort
func (ports PortsContainer) GetExternalPort(internalPort int) int {
	for _, p := range ports {
		if p.Internal == internalPort {
			return p.External
		}
	}
	return 0
}

// AsPorts convert container ports to image ports
func (ports PortsContainer) AsPorts() Ports {
	var result = []Port{}
	for _, p := range ports {
		result = append(result, Port{Internal: p.Internal, Protocol: p.Protocol})
	}
	return result
}

// ParameterContainer is an env variables given to the creation of the container
type ParameterContainer struct {
	ID    bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Name  string        `bson:"name" json:"name"`
	Value string        `bson:"value" json:"value"`
}

// ParametersContainer is a slice of ParameterContainer
type ParametersContainer []ParameterContainer

// AsParameters convert container parameters to image parameters
func (parameters ParametersContainer) AsParameters() Parameters {
	var result = []Parameter{}
	for _, p := range parameters {
		result = append(result, Parameter{Name: p.Name, Value: p.Value})
	}
	return result
}

// Format prints a parameter container as a string like : key=value
func (pc ParameterContainer) Format() string {
	if pc.Name == "" || pc.Value == "" {
		return ""
	}
	return pc.Name + "=" + pc.Value
}

func (pc ParameterContainer) String() string {
	return pc.Format()
}

// VariableContainer is a variable for the container
type VariableContainer struct {
	ID    bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Name  string        `bson:"name" json:"name"`
	Value string        `bson:"value" json:"value"`
}

// Format prints a parameter container as a string like : key=value
func (v VariableContainer) Format() string {
	if v.Name == "" || v.Value == "" {
		return ""
	}
	return v.Name + "=" + v.Value
}

func (v VariableContainer) String() string {
	return v.Format()
}

// VariablesContainer is a slice of VariableContainer
type VariablesContainer []VariableContainer

// AsVariables convert container variables to image variables
func (variables VariablesContainer) AsVariables() Variables {
	var result = []Variable{}
	for _, v := range variables {
		result = append(result, Variable{Name: v.Name, Value: v.Value})
	}
	return result
}

// VolumeContainer is a volume mapped to the container
type VolumeContainer struct {
	ID       bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Internal string        `bson:"internal" json:"internal"`
	External string        `bson:"external" json:"external"`
	Rights   Rights        `bson:"rights" json:"rights"`
}

// VolumesContainer is a slice of VolumeContainer
type VolumesContainer []VolumeContainer

// Format prints a volume as string string like : external:internal:(rw/ro)
func (vc VolumeContainer) Format() string {
	if vc.External == "" || vc.Internal == "" {
		return ""
	}

	var rights string
	if vc.Rights == "" {
		rights = "rw"
	} else {
		rights = string(vc.Rights)
	}
	return vc.External + ":" + vc.Internal + ":" + rights
}

// AsVolumes convert container volumes to image volumes
func (volumes VolumesContainer) AsVolumes() Volumes {
	var result = []Volume{}
	for _, v := range volumes {
		result = append(result, Volume{Internal: v.Internal, Value: v.External, Rights: v.Rights})
	}
	return result
}

// JobContainer is a job lunched for the container
type JobContainer struct {
	ID            bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Name          string        `bson:"name" json:"name"`
	JobID         string        `bson:"jobId" json:"jobId"`
	Description   string        `bson:"description" json:"description"`
	Result        string        `bson:"result" json:"result"`
	Status        string        `bson:"status" json:"status"`
	LastExecution string        `bson:"lastExecution" json:"lastExecution"`
}

// JobsContainer is a slice of jobs
type JobsContainer []JobContainer

// Container is a container associated to the group
type Container struct {
	ID           bson.ObjectId       `bson:"_id,omitempty" json:"id,omitempty"`
	Name         string              `bson:"name" json:"name"`
	Hostname     string              `bson:"hostname" json:"hostname"`
	Image        string              `bson:"image" json:"image"`
	ServiceTitle string              `bson:"serviceTitle" json:"serviceTitle"`
	ServiceID    string              `bson:"serviceId" json:"serviceId"`
	ContainerID  string              `bson:"containerId" json:"containerId"`
	Parameters   ParametersContainer `bson:"parameters" json:"parameters"`
	Ports        PortsContainer      `bson:"ports" json:"ports"`
	Variables    VariablesContainer  `bson:"variables" json:"variables"`
	Volumes      VolumesContainer    `bson:"volumes" json:"volumes"`
	Jobs         JobsContainer       `bson:"jobs" json:"jobs"`
	DaemonID     string              `bson:"daemonId,omitempty" json:"daemonId,omitempty"`
	Active       bool                `bson:"active" json:"active"`
}

// Containers is a slice of Container
type Containers []Container

// AddParameter adds a ParameterContainer to the Container
func (c *Container) AddParameter(p ParameterContainer) {
	c.Parameters = append(c.Parameters, p)
}

// AddPort adds a PortContainer to the Container
func (c *Container) AddPort(p PortContainer) {
	c.Ports = append(c.Ports, p)
}

// AddVariable adds a VariableContainer to the Container
func (c *Container) AddVariable(v VariableContainer) {
	c.Variables = append(c.Variables, v)
}

// AddVolume adds a VolumeContainer to the Container
func (c *Container) AddVolume(v VolumeContainer) {
	c.Volumes = append(c.Volumes, v)
}

// AddJob adds a JobContainer to the Container
func (c *Container) AddJob(j JobContainer) {
	c.Jobs = append(c.Jobs, j)
}
