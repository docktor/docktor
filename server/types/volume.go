package types

import (
	"fmt"
	"regexp"

	"gopkg.in/mgo.v2/bson"
)

const volumeNamePattern = `^[^\0]+$`

// Rights defines the volume rights
type Rights string

// IsValid returns true if the rights are valid (is ro or rw)
func (r Rights) IsValid() bool {
	return r == ReadOnlyRights || r == ReadWriteRights
}

const (
	// ReadOnlyRights are rights when volume is in read only mode
	ReadOnlyRights Rights = "ro"
	// ReadWriteRights are rights when volume is in read write mode
	ReadWriteRights Rights = "rw"
)

// Volume is a binding between a folder from inside the container to the host machine
type Volume struct {
	ID          bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Internal    string        `bson:"internal" json:"internal" validate:"required"`                 // volume inside the container
	External    string        `bson:"external" json:"external"`                                     // volume outside the container
	Rights      Rights        `bson:"rights,omitempty" json:"rights,omitempty" validate:"required"` // ro or rw
	Description string        `bson:"description,omitempty" json:"description,omitempty"`
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

var volumeNameRegex = regexp.MustCompile(volumeNamePattern)

// Validate checks that the volume is valid.
// Volume is valid when :
// Internal volume is not empty and does not contains the \0 character,
// External does not contains the \0 character and
// Rights are either ro or rw
func (v Volume) Validate() error {

	if !volumeNameRegex.MatchString(v.Internal) {
		return fmt.Errorf("Internal Volume %q does not match regex %q", v.Internal, volumeNamePattern)
	}

	if v.External != "" && !volumeNameRegex.MatchString(v.External) {
		return fmt.Errorf("Variable of Name %q does not match regex %q", v.Internal, volumeNamePattern)
	}

	if !v.Rights.IsValid() {
		return fmt.Errorf(`Rights %q of internal volume %q should be either "ro" or "rw"`, v.Rights, v.Internal)
	}
	return nil
}

// Volumes is a slice of volumes
type Volumes []Volume

// Validate validates that all the volumes are valid
// Returns in error when at the first invalid volume.
func (vs Volumes) Validate() error {
	for _, v := range vs {
		if err := v.Validate(); err != nil {
			return err
		}
	}
	return nil
}

// Equals check that two slices of volumes have the same content
func (vs Volumes) Equals(b Volumes) bool {

	if vs == nil && b == nil {
		return true
	}

	if vs == nil || b == nil {
		return false
	}

	if len(vs) != len(b) {
		return false
	}

	var vsMap = map[string]Volume{}
	for _, v := range vs {
		key := v.Internal + ":" + string(v.Rights)
		vsMap[key] = v
	}

	for _, v := range b {
		key := v.Internal + ":" + string(v.Rights)
		_, ok := vsMap[key]
		if !ok {
			return false
		}
	}

	return true
}

// IsIncluded check that the first slice is included into the second
func (vs Volumes) IsIncluded(b Volumes) bool {

	if vs == nil && b == nil {
		return true
	}

	if vs == nil || b == nil {
		return false
	}

	if len(vs) > len(b) {
		return false
	}

	var bMap = map[string]Volume{}
	for _, v := range b {
		key := v.Internal + ":" + string(v.Rights)
		bMap[key] = v
	}

	for _, v := range vs {
		key := v.Internal + ":" + string(v.Rights)
		_, ok := bMap[key]
		if !ok {
			return false
		}
	}

	return true
}
