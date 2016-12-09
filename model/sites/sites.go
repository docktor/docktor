package sites

import (
	"github.com/soprasteria/docktor/model/types"
	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// Repo is the repository for projects
type Repo struct {
	Coll *mgo.Collection
}

// Save a site into a database
func (r *Repo) Save(site types.Site) (types.Site, error) {
	if site.ID.Hex() == "" {
		site.ID = bson.NewObjectId()
	}

	_, err := r.Coll.UpsertId(site.ID, bson.M{"$set": site})
	return site, err
}

// Delete a site in database
func (r *Repo) Delete(id bson.ObjectId) (bson.ObjectId, error) {
	err := r.Coll.RemoveId(id)
	return id, err
}

// FindByID get the site by its id
func (r *Repo) FindByID(id string) (types.Site, error) {
	result := types.Site{}
	err := r.Coll.FindId(bson.ObjectIdHex(id)).One(&result)
	return result, err
}

// FindByIDBson get the site by its id (as a bson object)
func (r *Repo) FindByIDBson(id bson.ObjectId) (types.Site, error) {
	result := types.Site{}
	err := r.Coll.FindId(id).One(&result)
	return result, err
}

// Find get the first site with a given title
func (r *Repo) Find(title string) (types.Site, error) {
	result := types.Site{}
	err := r.Coll.Find(bson.M{"title": title}).One(&result)
	return result, err
}

// FindAll get all sites
func (r *Repo) FindAll() ([]types.Site, error) {
	results := []types.Site{}
	err := r.Coll.Find(bson.M{}).All(&results)
	return results, err
}

// Drop drops the content of the collection
func (r *Repo) Drop() error {
	return r.Coll.DropCollection()
}
