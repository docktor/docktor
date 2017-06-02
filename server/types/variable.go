package types

import "gopkg.in/mgo.v2/bson"

// Variable like environment variables (GID of user for example)
type Variable struct {
	ID          bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Name        string        `bson:"name" json:"name"`
	Value       string        `bson:"value,omitempty" json:"value,omitempty"`
	Description string        `bson:"description" json:"description"`
}

// Format prints a parameter container as a string like : key=value
func (v Variable) Format() string {
	if v.Name == "" || v.Value == "" {
		return ""
	}
	return v.Name + "=" + v.Value
}

func (v Variable) String() string {
	return v.Format()
}

// Equals checks that two variables are equals based on some properties
func (v Variable) Equals(b Variable) bool {
	return v.Name == b.Name
}

// Variables is a slice of variables
type Variables []Variable

// Equals check that two slices of variables have the same content
func (vs Variables) Equals(b Variables) bool {

	if vs == nil && b == nil {
		return true
	}

	if vs == nil || b == nil {
		return false
	}

	if len(vs) != len(b) {
		return false
	}

	var aMap = map[string]Variable{}
	for _, v := range vs {
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

// IsIncluded check that the first slices of variables is included into the second
func (vs Variables) IsIncluded(b Variables) bool {

	if vs == nil && b == nil {
		return true
	}

	if vs == nil || b == nil {
		return false
	}

	if len(vs) > len(b) {
		return false
	}

	var bMap = map[string]Variable{}
	for _, v := range b {
		bMap[v.Name] = v
	}

	for _, v := range vs {
		_, ok := bMap[v.Name]
		if !ok {
			return false
		}
	}
	return true
}
