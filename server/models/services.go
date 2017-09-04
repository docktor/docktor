package models

import (
	log "github.com/sirupsen/logrus"
	"github.com/soprasteria/docktor/server/types"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// ServicesRepo is the a repo for services
type ServicesRepo interface {
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
	// FindAllByIDs get all services with ids
	FindAllByIDs(ids []bson.ObjectId) ([]types.Service, error)
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

// DefaultServicesRepo is the repository for services
type DefaultServicesRepo struct {
	coll *mgo.Collection
}

// NewServicesRepo instantiate new ServicesRepo
func NewServicesRepo(coll *mgo.Collection) ServicesRepo {
	return &DefaultServicesRepo{coll: coll}
}

// GetCollectionName gets the name of the collection
func (r *DefaultServicesRepo) GetCollectionName() string {
	return r.coll.FullName
}

// Save a service into a database
func (r *DefaultServicesRepo) Save(service types.Service) (types.Service, error) {
	_, err := r.coll.UpsertId(service.ID, bson.M{"$set": service})
	return service, err
}

// Delete a group in database
func (r *DefaultServicesRepo) Delete(id bson.ObjectId) (bson.ObjectId, error) {
	err := r.coll.RemoveId(id)
	return id, err
}

// FindByID the service
func (r *DefaultServicesRepo) FindByID(id string) (types.Service, error) {
	result := types.Service{}
	err := r.coll.FindId(bson.ObjectIdHex(id)).One(&result)
	return result, err
}

// Find the service by its title, case-insensitive
func (r *DefaultServicesRepo) Find(title string) (types.Service, error) {
	result := types.Service{}
	err := r.coll.Find(bson.M{"title": &bson.RegEx{Pattern: "^" + title + "$", Options: "i"}}).One(&result)
	return result, err
}

// FindAll get all services by the regex name
func (r *DefaultServicesRepo) FindAll() ([]types.Service, error) {
	results := []types.Service{}
	err := r.coll.Find(bson.M{}).All(&results)
	return results, err
}

// FindAllByIDs get all services with id
func (r *DefaultServicesRepo) FindAllByIDs(ids []bson.ObjectId) ([]types.Service, error) {
	results := []types.Service{}
	err := r.coll.Find(
		bson.M{"_id": &bson.M{"$in": ids}},
	).All(&results)
	return results, err
}

// FindAllByRegex get all services by the regex name
func (r *DefaultServicesRepo) FindAllByRegex(nameRegex string) ([]types.Service, error) {
	results := []types.Service{}
	err := r.coll.Find(bson.M{"title": &bson.RegEx{Pattern: nameRegex, Options: "i"}}).All(&results)
	log.WithField("nameRegex", nameRegex).Info("Finding services by regex")
	return results, err
}

// IsExist checks that the service exists with given title
func (r *DefaultServicesRepo) IsExist(title string) bool {
	_, err := r.Find(title)
	return err == nil
}

// Drop drops the content of the collection
func (r *DefaultServicesRepo) Drop() error {
	return r.coll.DropCollection()
}

// RemoveTag removes given tag from all services
func (r *DefaultServicesRepo) RemoveTag(id bson.ObjectId) (*mgo.ChangeInfo, error) {
	return r.coll.UpdateAll(
		bson.M{"tags": bson.M{"$in": []bson.ObjectId{id}}},
		bson.M{"$pull": bson.M{"tags": id}},
	)
}
