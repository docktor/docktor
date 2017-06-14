package controllers

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo"
	"github.com/soprasteria/docktor/server/models"
	"github.com/soprasteria/docktor/server/modules/daemons"
	"github.com/soprasteria/docktor/server/types"
	"github.com/soprasteria/docktor/server/utils"
	"gopkg.in/mgo.v2/bson"
)

// Daemons contains all daemons handlers
type Daemons struct {
}

//GetAll daemons from docktor
func (d *Daemons) GetAll(c echo.Context) error {
	docktorAPI := c.Get("api").(*models.Docktor)
	daemons, err := docktorAPI.Daemons().FindAll()
	if err != nil {
		return c.String(http.StatusInternalServerError, "Error while retreiving all daemons")
	}
	return c.JSON(http.StatusOK, daemons)
}

//Save daemon into docktor
func (d *Daemons) Save(c echo.Context) error {
	docktorAPI := c.Get("api").(*models.Docktor)
	var daemon types.Daemon
	err := c.Bind(&daemon)

	if err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprintf("Error while binding daemon: %v", err))
	}

	// If the ID is empty, it's a creation, so generate an object ID
	if daemon.ID.Hex() == "" {
		daemon.ID = bson.NewObjectId()
	}

	res, err := docktorAPI.Daemons().Save(daemon)
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while saving daemon: %v", err))
	}
	return c.JSON(http.StatusOK, res)
}

//Delete daemon into docktor
func (d *Daemons) Delete(c echo.Context) error {
	docktorAPI := c.Get("api").(*models.Docktor)
	id := c.Param("daemonID")
	res, err := docktorAPI.Daemons().Delete(bson.ObjectIdHex(id))
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while remove daemon: %v", err))
	}
	return c.String(http.StatusOK, res.Hex())
}

//Get daemon from docktor
func (d *Daemons) Get(c echo.Context) error {
	daemon := c.Get("daemon").(types.Daemon)
	return c.JSON(http.StatusOK, daemon)
}

// GetInfo : get infos about daemon from docker
func (d *Daemons) GetInfo(c echo.Context) error {
	daemon := c.Get("daemon").(types.Daemon)
	forceParam := c.QueryParam("force")
	redisClient := utils.GetRedis(c)

	infos, err := daemons.GetInfo(daemon, redisClient, forceParam == "true")
	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, infos)
}