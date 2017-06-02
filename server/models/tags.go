package models

import (
	"fmt"
	"time"

	log "github.com/Sirupsen/logrus"
	"github.com/soprasteria/docktor/server/types"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// TagAlreadyExistErrMessage is an error message when a tag alread exists
const TagAlreadyExistErrMessage string = "Tag %q already exists in category %q"

// TagsRepo is the repo for tags
type TagsRepo interface {
	// Save a tag into database
	Save(tag types.Tag) (types.Tag, error)
	// Delete a tag in database
	Delete(id bson.ObjectId) (bson.ObjectId, error)
	// FindByID get the tag by its id
	FindByID(id string) (types.Tag, error)
	// FindByIDBson get the tag by its id
	FindByIDBson(id bson.ObjectId) (types.Tag, error)
	// Find get the first tag with a given name and category
	Find(name string, category string) (types.Tag, error)
	// FindAll get all tags
	FindAll() ([]types.Tag, error)
	// FindAllByIDs get all tags with id
	FindAllByIDs([]bson.ObjectId) ([]types.Tag, error)
	// Drop drops the content of the collection
	Drop() error
}

// DefaultTagsRepo is the repository for tags
type DefaultTagsRepo struct {
	coll *mgo.Collection
}

// NewTagsRepo instantiate new RepoDaemons
func NewTagsRepo(coll *mgo.Collection) TagsRepo {
	return &DefaultTagsRepo{coll: coll}
}

// Save or create a tag into a database
// Two different tags can not have the same name and category (unicity is checked on slugified name and category)
func (r *DefaultTagsRepo) Save(tag types.Tag) (types.Tag, error) {

	// Create a new tag from input one because
	// we have to check each value and only update updatable fields (for example : created should not be changed)
	var resTag types.Tag

	tagByNameAndCat, err := r.Find(tag.Name.GetRaw(), tag.Category.GetRaw())

	if tag.ID.Hex() == "" {
		// New tag to create.
		if err == nil {
			// Tag cannot created when we found another tag with same info
			log.WithField("newtag_name", tag.Name).WithField("newtag_category", tag.Category).
				WithField("existingtag_name", tagByNameAndCat.Name).WithField("existingtag_category", tagByNameAndCat.Category).
				Warning("Can't create tag because it already exists...")
			return types.Tag{}, fmt.Errorf(
				TagAlreadyExistErrMessage,
				tag.Name.GetRaw(), tag.Category.GetRaw(),
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
			log.WithField("newtag_name", tag.Name).WithField("newtag_category", tag.Category).
				WithField("existingtag_name", tagByNameAndCat.Name).WithField("existingtag_category", tagByNameAndCat.Category).
				Warning("Can't update tag because it already exists...")
			return types.Tag{}, fmt.Errorf(
				TagAlreadyExistErrMessage,
				tagByNameAndCat.Name.GetRaw(), tagByNameAndCat.Category.GetRaw(),
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

	// Default values
	if resTag.UsageRights == "" {
		resTag.UsageRights = types.AdminRole
	}

	// Syntaxic Checks
	if resTag.Name.GetSlug() == "" {
		return types.Tag{}, fmt.Errorf("Name should not be empty : %q (slug:%q)", resTag.Name.GetRaw(), resTag.Name.GetSlug())
	}
	if resTag.Category.GetSlug() == "" {
		return types.Tag{}, fmt.Errorf("Category should not be empty : %q (slug:%q)", resTag.Category.GetRaw(), resTag.Category.GetSlug())
	}

	_, err = r.coll.UpsertId(resTag.ID, bson.M{"$set": resTag})
	return resTag, err
}

// Delete a tag in database
func (r *DefaultTagsRepo) Delete(id bson.ObjectId) (bson.ObjectId, error) {
	err := r.coll.RemoveId(id)
	return id, err
}

// FindByID get the tag by its id
func (r *DefaultTagsRepo) FindByID(id string) (types.Tag, error) {
	result := types.Tag{}
	err := r.coll.FindId(bson.ObjectIdHex(id)).One(&result)
	return result, err
}

// FindByIDBson get the tag by its id (as a bson object)
func (r *DefaultTagsRepo) FindByIDBson(id bson.ObjectId) (types.Tag, error) {
	result := types.Tag{}
	err := r.coll.FindId(id).One(&result)
	return result, err
}

// findBySlug get tag identified by its name slugified
func (r *DefaultTagsRepo) findBySlug(slugName string, slugCategory string) (types.Tag, error) {
	result := types.Tag{}
	err := r.coll.Find(bson.M{"name.slug": slugName, "category.slug": slugCategory}).One(&result)
	return result, err
}

// Find get the first tag with a given name
func (r *DefaultTagsRepo) Find(name string, category string) (types.Tag, error) {
	tagName := types.NewTagName(name)
	tagCategory := types.NewTagCategory(category)
	return r.findBySlug(tagName.GetSlug(), tagCategory.GetSlug())
}

// FindAll get all tags
func (r *DefaultTagsRepo) FindAll() ([]types.Tag, error) {
	results := []types.Tag{}
	err := r.coll.Find(bson.M{}).All(&results)
	return results, err
}

// FindAllByIDs get all tags with id
func (r *DefaultTagsRepo) FindAllByIDs(ids []bson.ObjectId) ([]types.Tag, error) {
	results := []types.Tag{}
	err := r.coll.Find(
		bson.M{"_id": &bson.M{"$in": ids}},
	).All(&results)
	return results, err
}

// Drop drops the content of the collection
func (r *DefaultTagsRepo) Drop() error {
	return r.coll.DropCollection()
}
