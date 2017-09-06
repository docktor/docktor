package models

import (
	"github.com/soprasteria/docktor/server/types"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// SitesRepo is the repo for sites
type SitesRepo interface {
	// Save a site into database
	Save(site types.Site) (types.Site, error)
	// Delete a site in database
	Delete(id bson.ObjectId) (bson.ObjectId, error)
	// FindByID get the site by its id
	FindByID(id string) (types.Site, error)
	// FindByIDBson get the site by its id
	FindByIDBson(id bson.ObjectId) (types.Site, error)
	// Find get the first site with a given title
	Find(title string) (types.Site, error)
	// FindAll get all sites
	FindAll() ([]types.Site, error)
	// Drop drops the content of the collection
	Drop() error
	// GetCollectionName returns the name of the collection
	GetCollectionName() string
}

// DefaultSitesRepo is the repository for sites
type DefaultSitesRepo struct {
	coll *mgo.Collection
}

// NewSitesRepo instantiate new SitesRepo
func NewSitesRepo(coll *mgo.Collection) SitesRepo {
	return &DefaultSitesRepo{coll: coll}
}

// GetCollectionName gets the name of the collection
func (r *DefaultSitesRepo) GetCollectionName() string {
	return r.coll.FullName
}

// Save a site into a database
func (r *DefaultSitesRepo) Save(site types.Site) (types.Site, error) {
	_, err := r.coll.UpsertId(site.ID, bson.M{"$set": site})
	return site, err
}

// Delete a site in database
func (r *DefaultSitesRepo) Delete(id bson.ObjectId) (bson.ObjectId, error) {
	err := r.coll.RemoveId(id)
	return id, err
}

// FindByID get the site by its id
func (r *DefaultSitesRepo) FindByID(id string) (types.Site, error) {
	result := types.Site{}
	err := r.coll.FindId(bson.ObjectIdHex(id)).One(&result)
	return result, err
}

// FindByIDBson get the site by its id (as a bson object)
func (r *DefaultSitesRepo) FindByIDBson(id bson.ObjectId) (types.Site, error) {
	result := types.Site{}
	err := r.coll.FindId(id).One(&result)
	return result, err
}

// Find get the first site with a given title
func (r *DefaultSitesRepo) Find(title string) (types.Site, error) {
	result := types.Site{}
	err := r.coll.Find(bson.M{"title": title}).One(&result)
	return result, err
}

// FindAll get all sites
func (r *DefaultSitesRepo) FindAll() ([]types.Site, error) {
	results := []types.Site{}
	err := r.coll.Find(bson.M{}).All(&results)
	return results, err
}

// Drop drops the content of the collection
func (r *DefaultSitesRepo) Drop() error {
	return r.coll.DropCollection()
}
