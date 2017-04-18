package daemons

import (
	"github.com/soprasteria/docktor/model/types"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// RepoDaemons is the repo for daemons
type RepoDaemons interface {
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
