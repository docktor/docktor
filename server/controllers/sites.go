package controllers

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo"
	api "github.com/soprasteria/docktor/model"
	"github.com/soprasteria/docktor/model/types"
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
		return c.String(http.StatusInternalServerError, "Error while retreiving all sites")
	}
	return c.JSON(http.StatusOK, sites)
}

//Save site into docktor
func (s *Sites) Save(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	var site types.Site
	err := c.Bind(&site)

	if err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprintf("Error while binding site: %v", err))
	}
	res, err := docktorAPI.Sites().Save(site)
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while saving site: %v", err))
	}
	return c.JSON(http.StatusOK, res)

}

//Delete site into docktor
func (s *Sites) Delete(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	id := c.Param("id")
	res, err := docktorAPI.Sites().Delete(bson.ObjectIdHex(id))
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while remove site: %v", err))
	}
	return c.JSON(http.StatusOK, RestResponse{ID: res.Hex()})
}
