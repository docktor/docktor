package models

import (
	"errors"
	"strings"

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
	// IsExist checks whether a daemon exists or not
	IsAnotherExist(daemon types.Daemon) bool
	// FindAllByHost gets all the daemons with a given name (representing the host)
	FindAllByHost(host string) ([]types.Daemon, error)
	// FindAllByHostRegex gets all the daemons with a name (representing the host) matching the regex
	FindAllByHostRegex(hostregex string) ([]types.Daemon, error)
	// FindAll get all daemons
	FindAll() ([]types.Daemon, error)
	// FindAllByIDs get all daemons with ids
	FindAllByIDs(ids []bson.ObjectId) ([]types.Daemon, error)
	// FindAllWithSite gets all daemons with given site id
	FindAllWithSite(siteID bson.ObjectId) ([]types.Daemon, error)
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

// CreateIndexes creates Index
func (r *DefaultDaemonsRepo) CreateIndexes() error {
	err := r.coll.EnsureIndex(mgo.Index{
		Key:    []string{"name"},
		Unique: true,
		Name:   "daemon_name_unique",
	})
	if err != nil {
		return err
	}
	return r.coll.EnsureIndex(mgo.Index{
		Key:    []string{"host", "port"},
		Unique: true,
		Name:   "daemon_host_port_unique",
	})
}

// GetCollectionName gets the name of the collection
func (r *DefaultDaemonsRepo) GetCollectionName() string {
	return r.coll.FullName
}

// Save a daemon into a database
func (r *DefaultDaemonsRepo) Save(daemon types.Daemon) (types.Daemon, error) {
	_, err := r.coll.UpsertId(daemon.ID, bson.M{"$set": daemon})
	if mgo.IsDup(err) {
		if strings.Contains(err.Error(), "daemon_host_port_unique") {
			return daemon, errors.New("Another daemon exists with same host and port")
		}
		return daemon, errors.New("Another daemon exists with same name")
	}
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

// Find get the first daemon with a given host
func (r *DefaultDaemonsRepo) Find(host string) (types.Daemon, error) {
	result := types.Daemon{}
	err := r.coll.Find(bson.M{"host": host}).One(&result)
	return result, err
}

// FindByName get the first daemon with the given name
func (r *DefaultDaemonsRepo) FindByName(name string) (types.Daemon, error) {
	result := types.Daemon{}
	err := r.coll.Find(bson.M{"name": name}).One(&result)
	return result, err
}

// IsAnotherExist checks that the daemon name already exists in database
func (r *DefaultDaemonsRepo) IsAnotherExist(daemon types.Daemon) bool {
	d, err := r.FindByName(daemon.Name)
	if err != nil || d.ID.Hex() == "" {
		return false
	}
	// Another daemon exists when found daemon is not the same
	return d.ID != daemon.ID
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

// FindAllByIDs get all daemons with ids
func (r *DefaultDaemonsRepo) FindAllByIDs(ids []bson.ObjectId) ([]types.Daemon, error) {
	results := []types.Daemon{}
	err := r.coll.Find(bson.M{"_id": bson.M{"$in": ids}}).All(&results)
	return results, err
}

// FindAllWithSite gets all daemons with given site id
func (r *DefaultDaemonsRepo) FindAllWithSite(siteID bson.ObjectId) ([]types.Daemon, error) {
	results := []types.Daemon{}
	err := r.coll.Find(bson.M{"site": siteID}).All(&results)
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
