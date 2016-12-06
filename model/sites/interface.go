package sites

import (
	"github.com/soprasteria/docktor/model/types"
	"gopkg.in/mgo.v2/bson"
)

// RepoSites is the repo for sites
type RepoSites interface {
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
}
