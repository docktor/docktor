package tags

import (
	"github.com/soprasteria/docktor/model/types"
	"gopkg.in/mgo.v2/bson"
)

// RepoTags is the repo for tags
type RepoTags interface {
	// Save a tag into database
	Save(tag types.Tag) (types.Tag, error)
	// Delete a tag in database
	Delete(id bson.ObjectId) (bson.ObjectId, error)
	// FindByID get the tag by its id
	FindByID(id string) (types.Tag, error)
	// FindByIDBson get the tag by its id
	FindByIDBson(id bson.ObjectId) (types.Tag, error)
	// Find get the first tag with a given name and category
	Find(name string, category string) (types.Tag, error)
	// FindAll get all tags
	FindAll() ([]types.Tag, error)
	// FindAllByIDs get all tags with id
	FindAllByIDs([]bson.ObjectId) ([]types.Tag, error)
	// Drop drops the content of the collection
	Drop() error
}
