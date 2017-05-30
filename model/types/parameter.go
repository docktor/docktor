package types

import "gopkg.in/mgo.v2/bson"

// Parameter for images ex: CpuShare, etc.
type Parameter struct {
	ID          bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Name        string        `bson:"name" json:"name"`
	Value       string        `bson:"value" json:"value"`
	Description string        `bson:"description" json:"description"`
}

// Format prints a parameter container as a string like : key=value
func (p Parameter) Format() string {
	if p.Name == "" || p.Value == "" {
		return ""
	}
	return p.Name + "=" + p.Value
}

func (p Parameter) String() string {
	return p.Format()
}

// Equals checks that two parameters are equals based on some properties
func (p Parameter) Equals(b Parameter) bool {
	return p.Name == b.Name
}

// Parameters is a slice of parameters
type Parameters []Parameter

// Equals check that two slices of parameters have the same content
func (ps Parameters) Equals(b Parameters) bool {

	if ps == nil && b == nil {
		return true
	}

	if ps == nil || b == nil {
		return false
	}

	if len(ps) != len(b) {
		return false
	}

	var aMap = map[string]Parameter{}
	for _, v := range ps {
		key := v.Name + v.Value + v.Description
		aMap[key] = v
	}

	for _, v := range b {
		key := v.Name + v.Value + v.Description
		_, ok := aMap[key]
		if !ok {
			return false
		}
	}
	return true
}

// IsIncluded check that the first slices of parameters is included into the second
func (ps Parameters) IsIncluded(b Parameters) bool {

	if ps == nil && b == nil {
		return true
	}

	if ps == nil || b == nil {
		return false
	}

	if len(ps) > len(b) {
		return false
	}

	var bMap = map[string]Parameter{}
	for _, v := range b {
		bMap[v.Name] = v
	}

	for _, v := range ps {
		_, ok := bMap[v.Name]
		if !ok {
			return false
		}
	}
	return true
}
