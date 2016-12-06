package daemons

import (
	"github.com/soprasteria/docktor/model/types"
	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// Repo is the repository for projects
type Repo struct {
	Coll *mgo.Collection
}

// Save a daemon into a database
func (r *Repo) Save(daemon types.Daemon) (types.Daemon, error) {
	if daemon.ID.Hex() == "" {
		daemon.ID = bson.NewObjectId()
	}

	_, err := r.Coll.UpsertId(daemon.ID, bson.M{"$set": daemon})
	return daemon, err
}

// Delete a daemon in database
func (r *Repo) Delete(id bson.ObjectId) (bson.ObjectId, error) {
	err := r.Coll.RemoveId(id)
	if err != nil {
		return id, err
	}
	return id, nil
}

// FindByID get the daemon by its id
func (r *Repo) FindByID(id string) (types.Daemon, error) {
	result := types.Daemon{}
	err := r.Coll.FindId(bson.ObjectIdHex(id)).One(&result)
	if err != nil {
		return result, err
	}

	return result, nil
}

// FindByIDBson get the daemon by its id (as a bson object)
func (r *Repo) FindByIDBson(id bson.ObjectId) (types.Daemon, error) {
	result := types.Daemon{}
	err := r.Coll.FindId(id).One(&result)
	if err != nil {
		return result, err
	}

	return result, nil
}

// Find get the first daemon with a given name (representing the host)
func (r *Repo) Find(host string) (types.Daemon, error) {
	result := types.Daemon{}
	err := r.Coll.Find(bson.M{"host": host}).One(&result)
	if err != nil {
		return result, err
	}

	return result, nil
}

// FindAllByHost gets all the daemons with a given name (representing the host)
func (r *Repo) FindAllByHost(host string) ([]types.Daemon, error) {
	result := []types.Daemon{}
	err := r.Coll.Find(bson.M{"host": host}).All(&result)
	if err != nil {
		return result, err
	}

	return result, nil
}

// FindAllByHostRegex gets all the daemons with a name (representing the host) matching the regex
func (r *Repo) FindAllByHostRegex(hostregex string) ([]types.Daemon, error) {
	result := []types.Daemon{}
	err := r.Coll.Find(bson.M{"host": &bson.RegEx{Pattern: hostregex}}).All(&result)
	if err != nil {
		return result, err
	}

	return result, nil
}

// FindAll get all daemons
func (r *Repo) FindAll() ([]types.Daemon, error) {
	results := []types.Daemon{}
	err := r.Coll.Find(bson.M{}).All(&results)
	if err != nil {
		return results, err
	}

	return results, nil
}

// Drop drops the content of the collection
func (r *Repo) Drop() error {
	return r.Coll.DropCollection()
}
