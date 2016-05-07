package controllers

import (
	"fmt"

	"github.com/labstack/echo"
	api "github.com/soprasteria/godocktor-api"
	"github.com/soprasteria/godocktor-api/types"
	"gopkg.in/mgo.v2/bson"
)

// DaemonsController contains all daemons handlers
type DaemonsController struct {
}

//GetAllDaemons from docktor
func (dc *DaemonsController) GetAllDaemons(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	daemons, err := docktorAPI.Daemons().FindAll()
	if err != nil {
		return c.String(500, "Error while retreiving all daemons")

	}
	return c.JSON(200, daemons)
}

//SaveDaemon into docktor
func (dc *DaemonsController) SaveDaemon(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	var daemon types.Daemon
	err := c.Bind(&daemon)

	if err != nil {
		return c.String(400, fmt.Sprintf("Error while binding daemon: %v", err))
	}
	res, err := docktorAPI.Daemons().Save(daemon)
	if err != nil {
		return c.String(500, fmt.Sprintf("Error while saving daemon: %v", err))
	}
	return c.JSON(200, res)
}

//DeleteDaemon into docktor
func (dc *DaemonsController) DeleteDaemon(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	id := c.Param("id")
	res, err := docktorAPI.Daemons().Delete(bson.ObjectIdHex(id))
	if err != nil {
		return c.String(500, fmt.Sprintf("Error while remove daemon: %v", err))
	}
	return c.JSON(200, res)
}
