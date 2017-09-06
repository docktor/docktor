package types

import (
	"strconv"

	"gopkg.in/mgo.v2/bson"
)

// Protocol defines the type of protocol used to reach a port
type Protocol string

const (
	// TCPProtocol is the TCP protocol
	TCPProtocol Protocol = "tcp"
	// UDPProtocol is the UDP protocol
	UDPProtocol Protocol = "udp"
)

// Port is a binding between a internal port and an external port
type Port struct {
	ID          bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Internal    int           `bson:"internal" json:"internal"`
	External    int           `bson:"external,omitempty" json:"external,omitempty"`
	Protocol    Protocol      `bson:"protocol" json:"protocol"`
	Description string        `bson:"description" json:"description"`
}

// Equals checks that two ports are equals based on some properties
func (p Port) Equals(b Port) bool {

	return (p.Internal == b.Internal || (p.Internal == -1 && b.Internal == 0) || (p.Internal == 0 && b.Internal == -1)) &&
		p.Protocol == b.Protocol
}

// Format prints a port as a string like : external:internal:protocol
func (p Port) Format() string {
	internal := strconv.Itoa(p.Internal)
	if internal == "0" || internal == "-1" {
		return ""
	}
	external := strconv.Itoa(p.External)
	if external == "0" || external == "-1" {
		return ""
	}

	return strconv.Itoa(p.External) + ":" + strconv.Itoa(p.Internal) + ":" + string(p.Protocol)
}

func (p Port) String() string {
	return p.Format()
}

// Ports is a slice of ports
type Ports []Port

// GetExternalPort search the external port bound to a given internalPort
func (ps Ports) GetExternalPort(internalPort int) int {
	for _, p := range ps {
		if p.Internal == internalPort {
			return p.External
		}
	}
	return 0
}

// Equals check that two slices of ports have the same content
func (ps Ports) Equals(b Ports) bool {

	if ps == nil && b == nil {
		return true
	}

	if ps == nil || b == nil {
		return false
	}

	if len(ps) != len(b) {
		return false
	}

	var aMap = map[string]Port{}
	for _, v := range ps {
		key := strconv.Itoa(v.Internal) + ":" + string(v.Protocol)
		aMap[key] = v
	}

	for _, v := range b {
		key := strconv.Itoa(v.Internal) + ":" + string(v.Protocol)
		_, ok := aMap[key]
		if !ok {
			return false
		}
	}

	return true
}

// IsIncluded check that the first slice is included into the second
func (ps Ports) IsIncluded(b Ports) bool {

	if ps == nil && b == nil {
		return true
	}

	if ps == nil || b == nil {
		return false
	}

	if len(ps) > len(b) {
		return false
	}

	var bMap = map[string]Port{}
	for _, v := range b {
		key := strconv.Itoa(v.Internal) + ":" + string(v.Protocol)
		bMap[key] = v
	}

	for _, v := range ps {
		key := strconv.Itoa(v.Internal) + ":" + string(v.Protocol)
		_, ok := bMap[key]
		if !ok {
			return false
		}
	}

	return true
}
