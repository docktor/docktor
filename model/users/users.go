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
	if err != nil {
		return id, err
	}
	return id, nil
}

// FindByID get the user by its id
func (r *Repo) FindByID(id string) (types.User, error) {
	result := types.User{}
	err := r.Coll.FindId(bson.ObjectIdHex(id)).One(&result)
	if err != nil {
		return result, err
	}

	return result, nil
}

// FindByIDBson get the user by its id (as a bson object)
func (r *Repo) FindByIDBson(id bson.ObjectId) (types.User, error) {
	result := types.User{}
	err := r.Coll.FindId(id).One(&result)
	if err != nil {
		return result, err
	}

	return result, nil
}

// Find get the first user with a given username
func (r *Repo) Find(username string) (types.User, error) {
	result := types.User{}
	err := r.Coll.Find(bson.M{"username": username}).One(&result)
	if err != nil {
		return result, err
	}

	return result, nil
}

// FindAll get all users
func (r *Repo) FindAll() ([]types.User, error) {
	results := []types.User{}
	err := r.Coll.Find(bson.M{}).All(&results)
	if err != nil {
		return results, err
	}

	return results, nil
}

// FindAllByGroupID get all users by group
func (r *Repo) FindAllByGroupID(id bson.ObjectId) ([]types.User, error) {
	results := []types.User{}
	err := r.Coll.Find(bson.M{"groups": bson.M{"$in": []bson.ObjectId{id}}}).All(&results)
	if err != nil {
		return results, err
	}

	return results, nil
}

// Drop drops the content of the collection
func (r *Repo) Drop() error {
	return r.Coll.DropCollection()
}
