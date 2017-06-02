package types

import "gopkg.in/mgo.v2/bson"

// Rights defines the volume rights
type Rights string

const (
	// ReadOnlyRights are rights when volume is in read only mode
	ReadOnlyRights Rights = "ro"
	// ReadWriteRights are rights when volume is in read write mode
	ReadWriteRights Rights = "rw"
)

// Volume is a binding between a folder from inside the container to the host machine
type Volume struct {
	ID          bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Internal    string        `bson:"internal" json:"internal"`                 // volume inside the container
	External    string        `bson:"external" json:"external"`                 // volume outside the contaienr
	Rights      Rights        `bson:"rights,omitempty" json:"rights,omitempty"` // ro or rw
	Description string        `bson:"description" json:"description"`
}

// Format prints a volume as a string like : external:internal:rights
func (v Volume) Format() string {

	var rights string
	if v.Rights == "" {
		rights = string(ReadWriteRights)
	} else {
		rights = string(v.Rights)
	}

	return v.External + ":" + v.Internal + ":" + rights
}

// Equals checks that two volumes are equals based on some properties
func (v Volume) Equals(b Volume) bool {
	return v.Internal == b.Internal && v.Rights == b.Rights
}

// Volumes is a slice of volumes
type Volumes []Volume

// Equals check that two slices of volumes have the same content
func (a Volumes) Equals(b Volumes) bool {

	if a == nil && b == nil {
		return true
	}

	if a == nil || b == nil {
		return false
	}

	if len(a) != len(b) {
		return false
	}

	var aMap = map[string]Volume{}
	for _, v := range a {
		key := v.Internal + ":" + string(v.Rights)
		aMap[key] = v
	}

	for _, v := range b {
		key := v.Internal + ":" + string(v.Rights)
		_, ok := aMap[key]
		if !ok {
			return false
		}
	}

	return true
}

// IsIncluded check that the first slice is included into the second
func (a Volumes) IsIncluded(b Volumes) bool {

	if a == nil && b == nil {
		return true
	}

	if a == nil || b == nil {
		return false
	}

	if len(a) > len(b) {
		return false
	}

	var bMap = map[string]Volume{}
	for _, v := range b {
		key := v.Internal + ":" + string(v.Rights)
		bMap[key] = v
	}

	for _, v := range a {
		key := v.Internal + ":" + string(v.Rights)
		_, ok := bMap[key]
		if !ok {
			return false
		}
	}

	return true
}
