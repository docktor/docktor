package controllers

import (
	"fmt"

	"github.com/labstack/echo"
	api "github.com/soprasteria/godocktor-api"
	"github.com/soprasteria/godocktor-api/types"
	"gopkg.in/mgo.v2/bson"
)

// Services contains all services handlers
type Services struct {
}

//GetAll services from docktor
func (s *Services) GetAll(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	services, err := docktorAPI.Services().FindAll()
	if err != nil {
		return c.String(500, "Error while retreiving all services")
	}
	return c.JSON(200, services)
}

//Save service into docktor
func (s *Services) Save(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	var service types.Service
	err := c.Bind(&service)

	if err != nil {
		return c.String(400, fmt.Sprintf("Error while binding service: %v", err))
	}
	res, err := docktorAPI.Services().Save(service)
	if err != nil {
		return c.String(500, fmt.Sprintf("Error while saving service: %v", err))
	}
	return c.JSON(200, res)
}

//Delete service into docktor
func (s *Services) Delete(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	id := c.Param("id")
	res, err := docktorAPI.Services().Delete(bson.ObjectIdHex(id))
	if err != nil {
		return c.String(500, fmt.Sprintf("Error while remove service: %v", err))
	}
	return c.JSON(200, res)
}
