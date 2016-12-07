package types

import (
	"time"

	"github.com/Machiel/slugify"
	"gopkg.in/mgo.v2/bson"
)

type TagName struct {
	Raw  string `bson:"raw" json:"raw"`
	Slug string `bson:"slug" json:"slug"`
}

func NewTagName(name string) TagName {
	return TagName{
		Raw:  name,
		Slug: slugify.Slugify(name),
	}
}

func (tn *TagName) GetRaw() string {
	return tn.Raw
}

func (tn *TagName) GetSlug() string {
	return tn.Slug
}

type TagCategory struct {
	Raw  string `bson:"raw" json:"raw"`
	Slug string `bson:"slug" json:"slug"`
}

func NewTagCategory(category string) TagCategory {
	return TagCategory{
		Raw:  category,
		Slug: slugify.Slugify(category),
	}
}

func (tc *TagCategory) GetRaw() string {
	return tc.Raw
}

func (tc *TagCategory) GetSlug() string {
	return tc.Slug
}

type Slugifiable interface {
	GetRaw() string  // Get the Raw value
	GetSlug() string // Get the Slug
}

// Tag is a string
type Tag struct {
	ID          bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Name        TagName       `bson:"name" json:"name"`         // The name the tag
	Category    TagCategory   `bson:"category" json:"category"` //
	UsageRights []Role        `bson:"usageRights,omitempty" json:"usageRights,omitempty"`
	Created     time.Time     `bson:"created" json:"created"`
	Updated     time.Time     `bson:"updated" json:"updated"`
}

// Tags is a slice of tags
type Tags []Tag
