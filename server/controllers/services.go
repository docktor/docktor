package controllers

import (
	"fmt"

	"github.com/labstack/echo"
	api "github.com/soprasteria/godocktor-api"
	"github.com/soprasteria/godocktor-api/types"
	"gopkg.in/mgo.v2/bson"
)

// ServicesController contains all services handlers
type ServicesController struct {
}

//GetAllServices from docktor
func (sc *ServicesController) GetAllServices(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	services, err := docktorAPI.Services().FindAll()
	if err != nil {
		return c.String(500, "Error while retreiving all services")
	}
	return c.JSON(200, services)
}

//SaveService into docktor
func (sc *ServicesController) SaveService(c echo.Context) error {
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

//DeleteService into docktor
func (sc *ServicesController) DeleteService(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	id := c.Param("id")
	res, err := docktorAPI.Services().Delete(bson.ObjectIdHex(id))
	if err != nil {
		return c.String(500, fmt.Sprintf("Error while remove service: %v", err))
	}
	return c.JSON(200, res)
}
