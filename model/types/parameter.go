package types

import "gopkg.in/mgo.v2/bson"

// Parameter for images ex: CpuShare, etc.
type Parameter struct {
	ID          bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Name        string        `bson:"name" json:"name"`
	Value       string        `bson:"value" json:"value"`
	Description string        `bson:"description" json:"description"`
}

// Parameters is a slice of parameters
type Parameters []Parameter

// Equals checks that two parameters are equals based on some properties
func (a Parameter) Equals(b Parameter) bool {
	return a.Name == b.Name
}

// Equals check that two slices of parameters have the same content
func (a Parameters) Equals(b Parameters) bool {

	if a == nil && b == nil {
		return true
	}

	if a == nil || b == nil {
		return false
	}

	if len(a) != len(b) {
		return false
	}

	var aMap = map[string]Parameter{}
	for _, v := range a {
		aMap[v.Name] = v
	}

	for _, v := range b {
		_, ok := aMap[v.Name]
		if !ok {
			return false
		}
	}
	return true
}

// IsIncluded check that the first slices of parameters is included into the second
func (a Parameters) IsIncluded(b Parameters) bool {

	if a == nil && b == nil {
		return true
	}

	if a == nil || b == nil {
		return false
	}

	if len(a) > len(b) {
		return false
	}

	var bMap = map[string]Parameter{}
	for _, v := range b {
		bMap[v.Name] = v
	}

	for _, v := range a {
		_, ok := bMap[v.Name]
		if !ok {
			return false
		}
	}
	return true
}
