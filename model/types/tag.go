package types

import (
	"time"

	"github.com/Machiel/slugify"
	"gopkg.in/mgo.v2/bson"
)

//TagName is the name of a tag, represented by its raw name and its slugified one (Slug is unique)
type TagName struct {
	Raw  string `bson:"raw" json:"raw"`
	Slug string `bson:"slug" json:"slug"`
}

// NewTagName creates a new tag name from a raw name
func NewTagName(name string) TagName {
	return TagName{
		Raw:  name,
		Slug: slugify.Slugify(name),
	}
}

// GetRaw gets the raw name of a tag
func (tn *TagName) GetRaw() string {
	return tn.Raw
}

// GetSlug gets the slugified name of a tag
func (tn *TagName) GetSlug() string {
	return tn.Slug
}

//TagCategory is the category of a tag, represented by its raw name and its slugified one (Slug is unique)
type TagCategory struct {
	Raw  string `bson:"raw" json:"raw"`
	Slug string `bson:"slug" json:"slug"`
}

// NewTagCategory creates a new tag category from a raw category name
func NewTagCategory(category string) TagCategory {
	return TagCategory{
		Raw:  category,
		Slug: slugify.Slugify(category),
	}
}

// GetRaw gets the raw category of a tag
func (tc *TagCategory) GetRaw() string {
	return tc.Raw
}

// GetSlug gets the slugified category of a tag
func (tc *TagCategory) GetSlug() string {
	return tc.Slug
}

// Slugifiable is an interface representing something that has a raw representation and a slugified one
type Slugifiable interface {
	GetRaw() string  // Get the Raw value
	GetSlug() string // Get the Slug
}

// Tag is a string
type Tag struct {
	ID          bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Name        TagName       `bson:"name" json:"name"` // The name the tag
	Category    TagCategory   `bson:"category" json:"category"`
	UsageRights Role          `bson:"usageRights,omitempty" json:"usageRights,omitempty"`
	Created     time.Time     `bson:"created" json:"created"`
	Updated     time.Time     `bson:"updated" json:"updated"`
}

// Tags is a slice of tags
type Tags []Tag
