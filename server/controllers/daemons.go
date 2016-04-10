package controllers

import (
	"github.com/gin-gonic/gin"
	api "github.com/soprasteria/godocktor-api"
	"github.com/soprasteria/godocktor-api/types"
	"gopkg.in/mgo.v2/bson"
)

// DaemonsController contains all daemons handlers
type DaemonsController struct {
}

//GetAllDaemons from docktor
func (dc *DaemonsController) GetAllDaemons(c *gin.Context) {
	docktorAPI := c.MustGet("api").(*api.Docktor)
	daemons, err := docktorAPI.Daemons().FindAll()
	if err != nil {
		c.String(500, "Error while retreiving all daemons")
		return
	}
	c.JSON(200, daemons)
}

//SaveDaemon into docktor
func (dc *DaemonsController) SaveDaemon(c *gin.Context) {
	docktorAPI := c.MustGet("api").(*api.Docktor)
	var daemon types.Daemon
	err := c.Bind(&daemon)

	if err != nil {
		c.String(400, "Error while binding daemon: %v", err)
	}
	res, err := docktorAPI.Daemons().Save(daemon)
	if err != nil {
		c.String(500, "Error while saving daemon: %v", err)
		return
	}
	c.JSON(200, res)

}

//DeleteDaemon into docktor
func (dc *DaemonsController) DeleteDaemon(c *gin.Context) {
	docktorAPI := c.MustGet("api").(*api.Docktor)
	id := c.Param("id")
	res, err := docktorAPI.Daemons().Delete(bson.ObjectIdHex(id))
	if err != nil {
		c.String(500, "Error while remove daemon: %v", err)
		return
	}
	c.JSON(200, res)
}
