package services

import (
	log "github.com/Sirupsen/logrus"
	"github.com/soprasteria/docktor/model/types"
	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// Repo is the repository for services
type Repo struct {
	Coll *mgo.Collection
}

// GetCollectionName gets the name of the collection
func (r *Repo) GetCollectionName() string {
	return r.Coll.FullName
}

// Save a service into a database
func (r *Repo) Save(service types.Service) (types.Service, error) {
	_, err := r.Coll.UpsertId(service.ID, bson.M{"$set": service})
	return service, err
}

// Delete a group in database
func (r *Repo) Delete(id bson.ObjectId) (bson.ObjectId, error) {
	err := r.Coll.RemoveId(id)
	return id, err
}

// FindByID the service
func (r *Repo) FindByID(id string) (types.Service, error) {
	result := types.Service{}
	err := r.Coll.FindId(bson.ObjectIdHex(id)).One(&result)
	return result, err
}

// Find the service by its title, case-insensitive
func (r *Repo) Find(title string) (types.Service, error) {
	result := types.Service{}
	err := r.Coll.Find(bson.M{"title": &bson.RegEx{Pattern: "^" + title + "$", Options: "i"}}).One(&result)
	return result, err
}

// FindAll get all services by the regex name
func (r *Repo) FindAll() ([]types.Service, error) {
	results := []types.Service{}
	err := r.Coll.Find(bson.M{}).All(&results)
	return results, err
}

// FindAllByRegex get all services by the regex name
func (r *Repo) FindAllByRegex(nameRegex string) ([]types.Service, error) {
	results := []types.Service{}
	err := r.Coll.Find(bson.M{"title": &bson.RegEx{Pattern: nameRegex, Options: "i"}}).All(&results)
	log.WithField("nameRegex", nameRegex).Info("Finding services by regex")
	return results, err
}

// IsExist checks that the service exists with given title
func (r *Repo) IsExist(title string) bool {
	_, err := r.Find(title)
	return err == nil
}

// Drop drops the content of the collection
func (r *Repo) Drop() error {
	return r.Coll.DropCollection()
}

// RemoveTag removes given tag from all services
func (r *Repo) RemoveTag(id bson.ObjectId) (*mgo.ChangeInfo, error) {
	return r.Coll.UpdateAll(
		bson.M{"tags": bson.M{"$in": []bson.ObjectId{id}}},
		bson.M{"$pull": bson.M{"tags": id}},
	)
}