package controllers

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo"
	api "github.com/soprasteria/docktor/model"
	"github.com/soprasteria/docktor/model/types"
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
		return c.String(http.StatusInternalServerError, "Error while retreiving all services")
	}
	return c.JSON(http.StatusOK, services)
}

//Save service into docktor
func (s *Services) Save(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	var service types.Service
	err := c.Bind(&service)

	if err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprintf("Error while binding service: %v", err))
	}
	res, err := docktorAPI.Services().Save(service)
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while saving service: %v", err))
	}
	return c.JSON(http.StatusOK, res)
}

//Delete service into docktor
func (s *Services) Delete(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	id := c.Param("serviceID")
	res, err := docktorAPI.Services().Delete(bson.ObjectIdHex(id))
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while remove service: %v", err))
	}
	return c.JSON(http.StatusOK, res)
}

//Get service from docktor
func (s *Services) Get(c echo.Context) error {
	service := c.Get("service").(types.Service)
	return c.JSON(http.StatusOK, service)
}
