package users

import (
	"github.com/soprasteria/docktor/model/types"
	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// Repo is the repository for projects
type Repo struct {
	Coll *mgo.Collection
}

// Save a user into a database
func (r *Repo) Save(user types.User) (types.User, error) {
	if user.ID.Hex() == "" {
		user.ID = bson.NewObjectId()
	}

	_, err := r.Coll.UpsertId(user.ID, bson.M{"$set": user})
	return user, err
}

// Delete a user in database
func (r *Repo) Delete(id bson.ObjectId) (bson.ObjectId, error) {
	err := r.Coll.RemoveId(id)
	return id, err
}

// FindByID get the user by its id
func (r *Repo) FindByID(id string) (types.User, error) {
	result := types.User{}
	err := r.Coll.FindId(bson.ObjectIdHex(id)).One(&result)
	return result, err
}

// FindByIDBson get the user by its id (as a bson object)
func (r *Repo) FindByIDBson(id bson.ObjectId) (types.User, error) {
	result := types.User{}
	err := r.Coll.FindId(id).One(&result)
	return result, err
}

// Find get the first user with a given username
func (r *Repo) Find(username string) (types.User, error) {
	result := types.User{}
	err := r.Coll.Find(bson.M{
		"username": bson.RegEx{Pattern: username, Options: "i"},
	}).One(&result)
	return result, err
}

// FindAll get all users
func (r *Repo) FindAll() ([]types.User, error) {
	results := []types.User{}
	err := r.Coll.Find(bson.M{}).All(&results)
	return results, err
}

// FindAllByIds get all users from a list of ids
func (r *Repo) FindAllByIds(ids []bson.ObjectId) ([]types.User, error) {
	results := []types.User{}
	err := r.Coll.Find(bson.M{"_id": bson.M{"$in": ids}}).All(&results)
	return results, err
}

// FindAllByGroupID get all users by group
func (r *Repo) FindAllByGroupID(id bson.ObjectId) ([]types.User, error) {
	results := []types.User{}
	err := r.Coll.Find(bson.M{"groups": bson.M{"$in": []bson.ObjectId{id}}}).All(&results)
	return results, err
}

// Drop drops the content of the collection
func (r *Repo) Drop() error {
	return r.Coll.DropCollection()
}
