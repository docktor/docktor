package controllers

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo"
	api "github.com/soprasteria/docktor/model"
	"github.com/soprasteria/docktor/model/types"
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
		return c.String(http.StatusInternalServerError, "Error while retreiving all groups")
	}
	return c.JSON(http.StatusOK, groups)
}

//Save group into docktor
func (g *Groups) Save(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	var group types.Group
	err := c.Bind(&group)

	if err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprintf("Error while binding group: %v", err))
	}

	// If the ID is empty, it's a creation, so generate an object ID
	if group.ID.Hex() == "" {
		group.ID = bson.NewObjectId()
	}

	res, err := docktorAPI.Groups().Save(group)
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while saving group: %v", err))
	}
	return c.JSON(http.StatusOK, res)
}

//Delete group into docktor
func (g *Groups) Delete(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	id := c.Param("id")
	res, err := docktorAPI.Groups().Delete(bson.ObjectIdHex(id))
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while remove group: %v", err))
	}
	return c.JSON(http.StatusOK, res)
}
