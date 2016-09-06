package controllers

import (
	"fmt"

	"github.com/labstack/echo"
	api "github.com/soprasteria/godocktor-api"
	"github.com/soprasteria/godocktor-api/types"
	"gopkg.in/mgo.v2/bson"
)

// Groups contains all groups handlers
type Groups struct {
}

//GetAll groups from docktor
func (g *Groups) GetAll(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	groups, err := docktorAPI.Groups().FindAll()
	if err != nil {
		return c.String(500, "Error while retreiving all groups")
	}
	return c.JSON(200, groups)
}

//Save group into docktor
func (g *Groups) Save(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	var group types.Group
	err := c.Bind(&group)

	if err != nil {
		return c.String(400, fmt.Sprintf("Error while binding group: %v", err))
	}
	res, err := docktorAPI.Groups().Save(group)
	if err != nil {
		return c.String(500, fmt.Sprintf("Error while saving group: %v", err))
	}
	return c.JSON(200, res)
}

//Delete group into docktor
func (g *Groups) Delete(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	id := c.Param("id")
	res, err := docktorAPI.Groups().Delete(bson.ObjectIdHex(id))
	if err != nil {
		return c.String(500, fmt.Sprintf("Error while remove group: %v", err))
	}
	return c.JSON(200, res)
}
