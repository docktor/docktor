package controllers

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo"
	api "github.com/soprasteria/docktor/model"
	"github.com/soprasteria/docktor/model/types"
	"gopkg.in/mgo.v2/bson"
)

// Tags contains all group handlers
type Tags struct {
}

//GetAll tags from docktor
func (s *Tags) GetAll(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	tags, err := docktorAPI.Tags().FindAll()
	if err != nil {
		return c.String(http.StatusInternalServerError, "Error while retreiving all tags")
	}
	return c.JSON(http.StatusOK, tags)
}

//Save or update tag into docktor
func (s *Tags) Save(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	id := c.Param("id")

	var tag types.Tag
	err := c.Bind(&tag)
	if err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprintf("Error while binding tag: %v", err))
	}

	// Force ID in tag to be the one passed as parameter
	if id != "" && id != "-1" {
		if !bson.IsObjectIdHex(id) {
			return c.String(http.StatusBadRequest, fmt.Sprintf("ID %q is not a valid BSON id", id))
		}
		tag.ID = bson.ObjectIdHex(id)
	}

	fmt.Printf("%+v\n", tag)

	res, err := docktorAPI.Tags().Save(tag)

	fmt.Printf("%+v\n", res)

	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while saving tag: %v", err))
	}
	return c.JSON(http.StatusOK, res)

}

//Delete tag into docktor
func (s *Tags) Delete(c echo.Context) error {

	docktorAPI := c.Get("api").(*api.Docktor)
	id := c.Param("id")
	res, err := docktorAPI.Tags().Delete(bson.ObjectIdHex(id))
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while remove tag: %v", err))
	}
	return c.JSON(http.StatusOK, RestResponse{ID: res.Hex()})
}
