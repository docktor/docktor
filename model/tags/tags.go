package tags

import (
	"fmt"
	"time"

	"github.com/soprasteria/docktor/model/types"
	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// TagAlreadyExistErrMessage is an error message when a tag alread exists
const TagAlreadyExistErrMessage string = "Tag %q with category %q already exist with slug name %q and slug category %q"

// Repo is the repository for projects
type Repo struct {
	Coll *mgo.Collection
}

// Save or create a tag into a database
// Two different tags can not have the same name and category (unicity is checked on slugified name and category)
func (r *Repo) Save(tag types.Tag) (types.Tag, error) {

	// Create a new tag from input one because
	// we have to check each value and only update updatable fields (for example : created should not be changed)
	var resTag types.Tag

	tagByNameAndCat, err := r.Find(tag.Name.GetRaw(), tag.Category.GetRaw())

	if tag.ID.Hex() == "" {
		// New tag to create.
		if err == nil {
			// Tag cannot created when we found another tag with same info
			return types.Tag{}, fmt.Errorf(
				TagAlreadyExistErrMessage,
				tag.Name.GetRaw(), tag.Category.GetRaw(),
				tagByNameAndCat.Name.GetSlug(), tagByNameAndCat.Category.GetSlug(),
			)
		}
		resTag.ID = bson.NewObjectId()
		resTag.Created = time.Now()
	} else {

		t, errFind := r.FindByIDBson(tag.ID)
		if errFind != nil {
			// Can't find tag by id
			return types.Tag{}, fmt.Errorf(
				"Can't update tag %q with category %q and id %q because it does not exist",
				tag.Name.GetRaw(), tag.Category.GetRaw(), tag.ID.Hex(),
			)
		}
		if tagByNameAndCat.ID.Hex() != "" && t.ID != tagByNameAndCat.ID {
			// Tag not updatable when another tag already uses same Name and Category
			return types.Tag{}, fmt.Errorf(
				TagAlreadyExistErrMessage,
				tagByNameAndCat.Name.GetRaw(), tagByNameAndCat.Category.GetRaw(),
				tagByNameAndCat.Name.GetSlug(), tagByNameAndCat.Category.GetSlug(),
			)
		}

		// Fill the fields by default from the one found on database
		// (like the creation date that could not be send by the client)
		resTag = t
	}

	// Update only what is updatable
	resTag.Name = types.NewTagName(tag.Name.GetRaw())
	resTag.Category = types.NewTagCategory(tag.Category.GetRaw())
	resTag.Updated = time.Now()
	resTag.UsageRights = tag.UsageRights

	_, err = r.Coll.UpsertId(resTag.ID, bson.M{"$set": resTag})
	return resTag, err
}

// Delete a tag in database
func (r *Repo) Delete(id bson.ObjectId) (bson.ObjectId, error) {
	err := r.Coll.RemoveId(id)
	return id, err
}

// FindByID get the tag by its id
func (r *Repo) FindByID(id string) (types.Tag, error) {
	result := types.Tag{}
	err := r.Coll.FindId(bson.ObjectIdHex(id)).One(&result)
	return result, err
}

// FindByIDBson get the tag by its id (as a bson object)
func (r *Repo) FindByIDBson(id bson.ObjectId) (types.Tag, error) {
	result := types.Tag{}
	err := r.Coll.FindId(id).One(&result)
	return result, err
}

// findBySlug get tag identified by its name slugified
func (r *Repo) findBySlug(slugName string, slugCategory string) (types.Tag, error) {
	result := types.Tag{}
	err := r.Coll.Find(bson.M{"name.slug": slugName, "category.slug": slugCategory}).One(&result)
	return result, err
}

// Find get the first tag with a given name
func (r *Repo) Find(name string, category string) (types.Tag, error) {
	tagName := types.NewTagName(name)
	tagCategory := types.NewTagCategory(category)
	return r.findBySlug(tagName.GetSlug(), tagCategory.GetSlug())
}

// FindAll get all tags
func (r *Repo) FindAll() ([]types.Tag, error) {
	results := []types.Tag{}
	err := r.Coll.Find(bson.M{}).All(&results)
	return results, err
}

// Drop drops the content of the collection
func (r *Repo) Drop() error {
	return r.Coll.DropCollection()
}
