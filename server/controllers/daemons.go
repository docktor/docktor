package controllers

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo"
	"github.com/soprasteria/docktor/server/daemons"
	"github.com/soprasteria/docktor/server/redisw"
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
		return c.String(http.StatusInternalServerError, "Error while retreiving all daemons")
	}
	return c.JSON(http.StatusOK, daemons)
}

//SaveDaemon into docktor
func (dc *DaemonsController) SaveDaemon(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	var daemon types.Daemon
	err := c.Bind(&daemon)

	if err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprintf("Error while binding daemon: %v", err))
	}
	res, err := docktorAPI.Daemons().Save(daemon)
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while saving daemon: %v", err))
	}
	return c.JSON(http.StatusOK, res)
}

//DeleteDaemon into docktor
func (dc *DaemonsController) DeleteDaemon(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	id := c.Param("id")
	res, err := docktorAPI.Daemons().Delete(bson.ObjectIdHex(id))
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while remove daemon: %v", err))
	}
	return c.JSON(http.StatusOK, res)
}

//GetDaemon from docktor
func (dc *DaemonsController) GetDaemon(c echo.Context) error {
	daemon := c.Get("daemon").(*api.Docktor)
	return c.JSON(http.StatusOK, daemon)
}

// GetDaemonInfo : get infos about daemon from docker
func (dc *DaemonsController) GetDaemonInfo(c echo.Context) error {
	daemon := c.Get("daemon").(types.Daemon)
	redisClient := redisw.GetRedis(c)

	infos, err := daemons.GetInfo(daemon, redisClient)
	if err != nil {
		return c.String(http.StatusOK, daemons.DaemonInvalidID)
	}
	return c.JSON(http.StatusOK, infos)
}
