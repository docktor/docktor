package controllers

import (
	"fmt"

	"github.com/labstack/echo"
	api "github.com/soprasteria/godocktor-api"
	"github.com/soprasteria/godocktor-api/types"
	"gopkg.in/mgo.v2/bson"
)

// UsersController contains all group handlers
type UsersController struct {
}

//GetAllUsers from docktor
func (uc *UsersController) GetAllUsers(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	sites, err := docktorAPI.Users().FindAll()
	if err != nil {
		return c.String(500, "Error while retreiving all users")
	}
	return c.JSON(200, sites)
}

//SaveUser into docktor
func (uc *UsersController) SaveUser(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	var user types.User
	err := c.Bind(&user)

	if err != nil {
		return c.String(400, fmt.Sprintf("Error while binding user: %v", err))
	}
	res, err := docktorAPI.Users().Save(user)
	if err != nil {
		return c.String(500, fmt.Sprintf("Error while saving user: %v", err))
	}
	return c.JSON(200, res)
}

//DeleteUser into docktor
func (uc *UsersController) DeleteUser(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	id := c.Param("id")
	res, err := docktorAPI.Users().Delete(bson.ObjectIdHex(id))
	if err != nil {
		return c.String(500, fmt.Sprintf("Error while remove user: %v", err))
	}
	return c.JSON(200, res)
}
