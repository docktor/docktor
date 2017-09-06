package controllers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/labstack/echo"
	"github.com/soprasteria/docktor/server/models"
	"github.com/soprasteria/docktor/server/types"
	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// Sites contains all group handlers
type Sites struct {
}

//GetAll sites from docktor
func (s *Sites) GetAll(c echo.Context) error {
	docktorAPI := c.Get("api").(*models.Docktor)
	sites, err := docktorAPI.Sites().FindAll()
	if err != nil {
		return c.String(http.StatusInternalServerError, "Error while retreiving all sites")
	}
	return c.JSON(http.StatusOK, sites)
}

//Save site into docktor
func (s *Sites) Save(c echo.Context) error {
	docktorAPI := c.Get("api").(*models.Docktor)
	var site types.Site
	err := c.Bind(&site)

	if err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprintf("Unable to parse Site received from client: %v", err))
	}

	// Update fields
	id := c.Param("siteID")
	if site.ID.Hex() == "" && id == "" {
		// New site to create
		site.ID = bson.NewObjectId()
		site.Created = time.Now()
	} else {
		// Existing daemon, search for it and update read-only fields
		site.ID = bson.ObjectIdHex(id)
		d, err := docktorAPI.Sites().FindByIDBson(site.ID)
		if err != nil {
			if err == mgo.ErrNotFound {
				return c.String(http.StatusBadRequest, fmt.Sprint("Site does not exist"))
			}
			return c.String(http.StatusInternalServerError, fmt.Sprintf("Unable to find site. Retry later : %s", err))
		}
		site.Created = d.Created
	}
	site.Updated = time.Now()

	// Validate fields from validator tags for common types
	if err = c.Validate(site); err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprintf("Some fields of site are not valid: %v", err))
	}

	res, err := docktorAPI.Sites().Save(site)
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while saving site: %v", err))
	}
	return c.JSON(http.StatusOK, res)

}

//Delete site into docktor
func (s *Sites) Delete(c echo.Context) error {
	docktorAPI := c.Get("api").(*models.Docktor)
	id := c.Param("siteID")

	// Don't delete the site if it's already used in another daaemon.
	daemons, err := docktorAPI.Daemons().FindAllWithSite(bson.ObjectIdHex(id))
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Unable to find linked daemons. Retry later : %s", err))
	}
	if len(daemons) > 0 {
		linkedDaemons := strings.Join(types.DaemonsName(daemons), "', '")
		return c.String(http.StatusBadRequest,
			fmt.Sprintf("Unable to remove site because it's already used in the following daemons: '%v'", linkedDaemons))
	}

	res, err := docktorAPI.Sites().Delete(bson.ObjectIdHex(id))
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while remove site: %v", err))
	}
	return c.String(http.StatusOK, res.Hex())
}
