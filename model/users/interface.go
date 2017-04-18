package users

import (
	"github.com/soprasteria/docktor/model/types"
	"gopkg.in/mgo.v2/bson"
)

// RepoUsers is the repo for users
type RepoUsers interface {
	// Save a user into database
	Save(user types.User) (types.User, error)
	// Delete a user in database
	Delete(id bson.ObjectId) (bson.ObjectId, error)
	// FindByID get the user by its id
	FindByID(id string) (types.User, error)
	// FindByIDBson get the user by its id
	FindByIDBson(id bson.ObjectId) (types.User, error)
	// Find get the first user with a given username
	Find(username string) (types.User, error)
	// FindAll get all users
	FindAll() ([]types.User, error)
	// FindAllByIds get all users filtered by their ids
	FindAllByIds(ids []bson.ObjectId) ([]types.User, error)
	// FindAllByGroupID get all users by a group ID
	FindAllByGroupID(id bson.ObjectId) ([]types.User, error)
	// Drop drops the content of the collection
	Drop() error
}
