package models

import (
	"github.com/soprasteria/docktor/server/types"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// UsersRepo is the repo for users
type UsersRepo interface {
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

// DefaultUsersRepo is the repository for users
type DefaultUsersRepo struct {
	coll *mgo.Collection
}

// NewUsersRepo instantiate new UsersRepo
func NewUsersRepo(coll *mgo.Collection) UsersRepo {
	return &DefaultUsersRepo{coll: coll}
}

// Save a user into a database
func (r *DefaultUsersRepo) Save(user types.User) (types.User, error) {
	if user.ID.Hex() == "" {
		user.ID = bson.NewObjectId()
	}

	_, err := r.coll.UpsertId(user.ID, bson.M{"$set": user})
	return user, err
}

// Delete a user in database
func (r *DefaultUsersRepo) Delete(id bson.ObjectId) (bson.ObjectId, error) {
	err := r.coll.RemoveId(id)
	return id, err
}

// FindByID get the user by its id
func (r *DefaultUsersRepo) FindByID(id string) (types.User, error) {
	result := types.User{}
	err := r.coll.FindId(bson.ObjectIdHex(id)).One(&result)
	return result, err
}

// FindByIDBson get the user by its id (as a bson object)
func (r *DefaultUsersRepo) FindByIDBson(id bson.ObjectId) (types.User, error) {
	result := types.User{}
	err := r.coll.FindId(id).One(&result)
	return result, err
}

// Find get the first user with a given username
func (r *DefaultUsersRepo) Find(username string) (types.User, error) {
	result := types.User{}
	err := r.coll.Find(bson.M{
		"username": bson.RegEx{Pattern: username, Options: "i"},
	}).One(&result)
	return result, err
}

// FindAll get all users
func (r *DefaultUsersRepo) FindAll() ([]types.User, error) {
	results := []types.User{}
	err := r.coll.Find(bson.M{}).All(&results)
	return results, err
}

// FindAllByIds get all users from a list of ids
func (r *DefaultUsersRepo) FindAllByIds(ids []bson.ObjectId) ([]types.User, error) {
	results := []types.User{}
	err := r.coll.Find(bson.M{"_id": bson.M{"$in": ids}}).All(&results)
	return results, err
}

// FindAllByGroupID get all users by group
func (r *DefaultUsersRepo) FindAllByGroupID(id bson.ObjectId) ([]types.User, error) {
	results := []types.User{}
	err := r.coll.Find(bson.M{"groups": bson.M{"$in": []bson.ObjectId{id}}}).All(&results)
	return results, err
}

// Drop drops the content of the collection
func (r *DefaultUsersRepo) Drop() error {
	return r.coll.DropCollection()
}
