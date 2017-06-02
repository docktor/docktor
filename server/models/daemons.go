package models

import (
	"github.com/soprasteria/docktor/server/types"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// DaemonsRepo is the repo for daemons
type DaemonsRepo interface {
	// Save a daemon into database
	Save(daemon types.Daemon) (types.Daemon, error)
	// Delete a daemon in database
	Delete(id bson.ObjectId) (bson.ObjectId, error)
	// FindByID get the daemon by its id
	FindByID(id string) (types.Daemon, error)
	// FindByIDBson get the daemon by its (bson representation)
	FindByIDBson(id bson.ObjectId) (types.Daemon, error)
	// Find get the first daemon with a given name
	Find(name string) (types.Daemon, error)
	// FindAllByHost gets all the daemons with a given name (representing the host)
	FindAllByHost(host string) ([]types.Daemon, error)
	// FindAllByHostRegex gets all the daemons with a name (representing the host) matching the regex
	FindAllByHostRegex(hostregex string) ([]types.Daemon, error)
	// FindAll get all daemons
	FindAll() ([]types.Daemon, error)
	// FindAllByIds get all daemons with ids
	FindAllByIds(ids []bson.ObjectId) ([]types.Daemon, error)
	// Drop drops the content of the collection
	Drop() error
	// RemoveTag remove a tag from a service
	RemoveTag(id bson.ObjectId) (*mgo.ChangeInfo, error)
	// GetCollectionName returns the name of the collection
	GetCollectionName() string
}

// DefaultDaemonsRepo is the repository for daemons
type DefaultDaemonsRepo struct {
	coll *mgo.Collection
}

// NewDaemonsRepo instantiate new RepoDaemons
func NewDaemonsRepo(coll *mgo.Collection) DaemonsRepo {
	return &DefaultDaemonsRepo{coll: coll}
}

// GetCollectionName gets the name of the collection
func (r *DefaultDaemonsRepo) GetCollectionName() string {
	return r.coll.FullName
}

// Save a daemon into a database
func (r *DefaultDaemonsRepo) Save(daemon types.Daemon) (types.Daemon, error) {
	_, err := r.coll.UpsertId(daemon.ID, bson.M{"$set": daemon})
	return daemon, err
}

// Delete a daemon in database
func (r *DefaultDaemonsRepo) Delete(id bson.ObjectId) (bson.ObjectId, error) {
	err := r.coll.RemoveId(id)
	return id, err
}

// FindByID get the daemon by its id
func (r *DefaultDaemonsRepo) FindByID(id string) (types.Daemon, error) {
	result := types.Daemon{}
	err := r.coll.FindId(bson.ObjectIdHex(id)).One(&result)
	return result, err
}

// FindByIDBson get the daemon by its id (as a bson object)
func (r *DefaultDaemonsRepo) FindByIDBson(id bson.ObjectId) (types.Daemon, error) {
	result := types.Daemon{}
	err := r.coll.FindId(id).One(&result)
	return result, err
}

// Find get the first daemon with a given name (representing the host)
func (r *DefaultDaemonsRepo) Find(host string) (types.Daemon, error) {
	result := types.Daemon{}
	err := r.coll.Find(bson.M{"host": host}).One(&result)
	return result, err
}

// FindAllByHost gets all the daemons with a given name (representing the host)
func (r *DefaultDaemonsRepo) FindAllByHost(host string) ([]types.Daemon, error) {
	result := []types.Daemon{}
	err := r.coll.Find(bson.M{"host": host}).All(&result)
	return result, err
}

// FindAllByHostRegex gets all the daemons with a name (representing the host) matching the regex
func (r *DefaultDaemonsRepo) FindAllByHostRegex(hostregex string) ([]types.Daemon, error) {
	result := []types.Daemon{}
	err := r.coll.Find(bson.M{"host": &bson.RegEx{Pattern: hostregex}}).All(&result)
	return result, err
}

// FindAll get all daemons
func (r *DefaultDaemonsRepo) FindAll() ([]types.Daemon, error) {
	results := []types.Daemon{}
	err := r.coll.Find(bson.M{}).All(&results)
	return results, err
}

// FindAllByIds get all daemons with ids
func (r *DefaultDaemonsRepo) FindAllByIds(ids []bson.ObjectId) ([]types.Daemon, error) {
	results := []types.Daemon{}
	err := r.coll.Find(bson.M{"_id": bson.M{"$in": ids}}).All(&results)
	return results, err
}

// Drop drops the content of the collection
func (r *DefaultDaemonsRepo) Drop() error {
	return r.coll.DropCollection()
}

// RemoveTag removes given tag from all daemons
func (r *DefaultDaemonsRepo) RemoveTag(id bson.ObjectId) (*mgo.ChangeInfo, error) {
	return r.coll.UpdateAll(
		bson.M{"tags": bson.M{"$in": []bson.ObjectId{id}}},
		bson.M{"$pull": bson.M{"tags": id}},
	)
}
