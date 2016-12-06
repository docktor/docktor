package types

import (
	"strconv"

	"gopkg.in/mgo.v2/bson"
)

// Port is a binding between a internal port and an external port
type Port struct {
	ID          bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Internal    int           `bson:"internal" json:"internal"`
	Protocol    string        `bson:"protocol" json:"protocol"` // tcp/udp
	Description string        `bson:"description" json:"description"`
}

// Ports is a slice of ports
type Ports []Port

// Equals checks that two ports are equals based on some properties
func (a Port) Equals(b Port) bool {
	return a.Internal == b.Internal && a.Protocol == b.Protocol
}

// Equals check that two slices of ports have the same content
func (a Ports) Equals(b Ports) bool {

	if a == nil && b == nil {
		return true
	}

	if a == nil || b == nil {
		return false
	}

	if len(a) != len(b) {
		return false
	}

	var aMap = map[string]Port{}
	for _, v := range a {
		key := strconv.Itoa(v.Internal) + ":" + v.Protocol
		aMap[key] = v
	}

	for _, v := range b {
		key := strconv.Itoa(v.Internal) + ":" + v.Protocol
		_, ok := aMap[key]
		if !ok {
			return false
		}
	}

	return true
}

// IsIncluded check that the first slice is included into the second
func (a Ports) IsIncluded(b Ports) bool {

	if a == nil && b == nil {
		return true
	}

	if a == nil || b == nil {
		return false
	}

	if len(a) > len(b) {
		return false
	}

	var bMap = map[string]Port{}
	for _, v := range b {
		key := strconv.Itoa(v.Internal) + ":" + v.Protocol
		bMap[key] = v
	}

	for _, v := range a {
		key := strconv.Itoa(v.Internal) + ":" + v.Protocol
		_, ok := bMap[key]
		if !ok {
			return false
		}
	}

	return true
}
