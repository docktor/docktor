package services

import (
	"github.com/soprasteria/docktor/model/types"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

//RepoServices is the a repo for services
type RepoServices interface {
	// Save a service
	Save(service types.Service) (types.Service, error)
	// Delete a service
	Delete(id bson.ObjectId) (bson.ObjectId, error)
	// FindByID the service
	FindByID(id string) (types.Service, error)
	// Find the service by its title, case-insensitive
	Find(title string) (types.Service, error)
	// FindAll get all services
	FindAll() ([]types.Service, error)
	// FindAllByRegex get all services by the regex name
	FindAllByRegex(nameRegex string) ([]types.Service, error)
	// IsExist checks that the service exists with given title
	IsExist(title string) bool
	// Drop drops the content of the collection
	Drop() error
	// RemoveTag remove a tag from a service
	RemoveTag(id bson.ObjectId) (*mgo.ChangeInfo, error)
	// GetCollectionName returns the name of the collection
	GetCollectionName() string
}
