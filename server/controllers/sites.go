package controllers

import (
	"fmt"

	"github.com/labstack/echo"
	api "github.com/soprasteria/godocktor-api"
	"github.com/soprasteria/godocktor-api/types"
	"gopkg.in/mgo.v2/bson"
)

// Sites contains all group handlers
type Sites struct {
}

//GetAll sites from docktor
func (s *Sites) GetAll(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	sites, err := docktorAPI.Sites().FindAll()
	if err != nil {
		return c.String(500, "Error while retreiving all sites")
	}
	return c.JSON(200, sites)
}

//Save site into docktor
func (s *Sites) Save(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	var site types.Site
	err := c.Bind(&site)

	if err != nil {
		return c.String(400, fmt.Sprintf("Error while binding site: %v", err))
	}
	res, err := docktorAPI.Sites().Save(site)
	if err != nil {
		return c.String(500, fmt.Sprintf("Error while saving site: %v", err))
	}
	return c.JSON(200, res)

}

//Delete site into docktor
func (s *Sites) Delete(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	id := c.Param("id")
	res, err := docktorAPI.Sites().Delete(bson.ObjectIdHex(id))
	if err != nil {
		return c.String(500, fmt.Sprintf("Error while remove site: %v", err))
	}
	return c.JSON(200, RestResponse{ID: res.Hex()})
}
