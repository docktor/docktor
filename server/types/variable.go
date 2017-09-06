package types

import (
	"fmt"
	"regexp"

	"gopkg.in/mgo.v2/bson"
)

const variableNamePattern = `^[a-zA-Z0-9_]{1,200}$`

// Variable like environment variables (GID of user for example)
type Variable struct {
	ID          bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Name        string        `bson:"name" json:"name"`
	Value       string        `bson:"value,omitempty" json:"value,omitempty"`
	Description string        `bson:"description,omitempty" json:"description,omitempty"`
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

var variableNameRegex = regexp.MustCompile(variableNamePattern)

// Validate validates that the variable has right content
// For instance, the Name of a variable respects the '^[a-zA-Z0-9_]{1,200}$' regex pattern
func (v Variable) Validate() error {
	if !variableNameRegex.MatchString(v.Name) {
		return fmt.Errorf("Variable of Name %q does not match regex %q", v.Name, variableNamePattern)
	}
	return nil
}

// Variables is a slice of variables
type Variables []Variable

// Validate validates that all variables have right content
// It exists in error when a variable is not valid
func (vs Variables) Validate() error {
	for _, v := range vs {
		if err := v.Validate(); err != nil {
			return err
		}
	}
	return nil
}

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
