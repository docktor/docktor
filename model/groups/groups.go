package groups

import (
	"github.com/soprasteria/docktor/model/types"
	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// Repo is the repository for projects
type Repo struct {
	Coll *mgo.Collection
}

// Drop drops the content of the collection
func (r *Repo) Drop() error {
	return r.Coll.DropCollection()
}

// Save a group into a database
func (r *Repo) Save(group types.Group) (types.Group, error) {
	if group.ID.Hex() == "" {
		group.ID = bson.NewObjectId()
	}

	_, err := r.Coll.UpsertId(group.ID, bson.M{"$set": group})
	return group, err
}

// Delete a group in database
func (r *Repo) Delete(id bson.ObjectId) (bson.ObjectId, error) {
	err := r.Coll.RemoveId(id)
	if err != nil {
		return id, err
	}
	return id, nil
}

// Find get the first group with a given name
func (r *Repo) Find(name string) (types.Group, error) {
	result := types.Group{}
	err := r.Coll.Find(bson.M{"title": name}).One(&result)
	if err != nil {
		return result, err
	}

	return result, nil
}

// FindByID get the group by its id
func (r *Repo) FindByID(id string) (types.Group, error) {
	result := types.Group{}
	err := r.Coll.FindId(bson.ObjectIdHex(id)).One(&result)
	if err != nil {
		return result, err
	}

	return result, nil
}

// FindByIDBson get the group by its id (as a bson object)
func (r *Repo) FindByIDBson(id bson.ObjectId) (types.Group, error) {
	result := types.Group{}
	err := r.Coll.FindId(id).One(&result)
	if err != nil {
		return result, err
	}

	return result, nil
}

// FindAll get all groups
func (r *Repo) FindAll() ([]types.Group, error) {
	results := []types.Group{}
	err := r.Coll.Find(bson.M{}).All(&results)
	if err != nil {
		return results, err
	}

	return results, nil
}

// FindAllByName get all groups by the give name
func (r *Repo) FindAllByName(name string) ([]types.Group, error) {
	results := []types.Group{}
	err := r.Coll.Find(bson.M{"title": name}).All(&results)
	if err != nil {
		return results, err
	}

	return results, nil
}

// FindAllByRegex get all groups by the regex name
func (r *Repo) FindAllByRegex(nameRegex string) ([]types.Group, error) {
	results := []types.Group{}
	err := r.Coll.Find(bson.M{"title": &bson.RegEx{Pattern: nameRegex}}).All(&results)
	if err != nil {
		return results, err
	}

	return results, nil
}

// FindAllWithContainers get all groups that contains a list of containers
func (r *Repo) FindAllWithContainers(groupNameRegex string, containersID []string) ([]types.Group, error) {
	results := []types.Group{}
	err := r.Coll.Find(
		bson.M{
			"title":                  &bson.RegEx{Pattern: groupNameRegex},
			"containers.containerId": &bson.M{"$in": containersID},
		}).All(&results)

	if err != nil {
		return results, err
	}

	return results, nil
}
