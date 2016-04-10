package controllers

import (
	"github.com/gin-gonic/gin"
	api "github.com/soprasteria/godocktor-api"
	"github.com/soprasteria/godocktor-api/types"
	"gopkg.in/mgo.v2/bson"
)

// ServicesController contains all services handlers
type ServicesController struct {
}

//GetAllServices from docktor
func (sc *ServicesController) GetAllServices(c *gin.Context) {
	docktorAPI := c.MustGet("api").(*api.Docktor)
	services, err := docktorAPI.Services().FindAll()
	if err != nil {
		c.String(500, "Error while retreiving all services")
		return
	}
	c.JSON(200, services)
}

//SaveService into docktor
func (sc *ServicesController) SaveService(c *gin.Context) {
	docktorAPI := c.MustGet("api").(*api.Docktor)
	var service types.Service
	err := c.Bind(&service)

	if err != nil {
		c.String(400, "Error while binding service: %v", err)
	}
	res, err := docktorAPI.Services().Save(service)
	if err != nil {
		c.String(500, "Error while saving service: %v", err)
		return
	}
	c.JSON(200, res)

}

//DeleteService into docktor
func (sc *ServicesController) DeleteService(c *gin.Context) {
	docktorAPI := c.MustGet("api").(*api.Docktor)
	id := c.Param("id")
	res, err := docktorAPI.Services().Delete(bson.ObjectIdHex(id))
	if err != nil {
		c.String(500, "Error while remove service: %v", err)
		return
	}
	c.JSON(200, res)
}
