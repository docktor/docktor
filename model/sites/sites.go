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
	if err != nil {
		return id, err
	}
	return id, nil
}

// FindByID get the site by its id
func (r *Repo) FindByID(id string) (types.Site, error) {
	result := types.Site{}
	err := r.Coll.FindId(bson.ObjectIdHex(id)).One(&result)
	if err != nil {
		return result, err
	}

	return result, nil
}

// FindByIDBson get the site by its id (as a bson object)
func (r *Repo) FindByIDBson(id bson.ObjectId) (types.Site, error) {
	result := types.Site{}
	err := r.Coll.FindId(id).One(&result)
	if err != nil {
		return result, err
	}

	return result, nil
}

// Find get the first site with a given title
func (r *Repo) Find(title string) (types.Site, error) {
	result := types.Site{}
	err := r.Coll.Find(bson.M{"title": title}).One(&result)
	if err != nil {
		return result, err
	}

	return result, nil
}

// FindAll get all sites
func (r *Repo) FindAll() ([]types.Site, error) {
	results := []types.Site{}
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
