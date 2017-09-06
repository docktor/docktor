package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/labstack/echo"
	"github.com/soprasteria/docktor/server/models"
	"github.com/soprasteria/docktor/server/modules/daemons"
	"github.com/soprasteria/docktor/server/types"
	"github.com/soprasteria/docktor/server/utils"
	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// Daemons contains all daemons handlers
type Daemons struct {
}

// GetAll daemons from docktor
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
		return c.String(http.StatusBadRequest, fmt.Sprintf("Unable to parse Daemon received from client: %v", err))
	}

	// Update fields
	id := c.Param("daemonID")
	if daemon.ID.Hex() == "" && id == "" {
		// New daemon to create
		daemon.ID = bson.NewObjectId()
		daemon.Created = time.Now()
	} else {
		// Existing daemon, search for it and update read-only fields
		daemon.ID = bson.ObjectIdHex(id)
		d, err := docktorAPI.Daemons().FindByIDBson(daemon.ID)
		if err != nil {
			if err == mgo.ErrNotFound {
				return c.String(http.StatusBadRequest, fmt.Sprint("Daemon does not exist"))
			}
			return c.String(http.StatusInternalServerError, fmt.Sprintf("Unable to find daemon. Retry later : %s", err))
		}
		daemon.Created = d.Created
	}
	if daemon.Protocol == types.HTTPProtocol {
		daemon.Ca = ""
		daemon.Key = ""
		daemon.Cert = ""
	}
	daemon.Updated = time.Now()

	// Validate fields from validator tags for common types
	if err = c.Validate(daemon); err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprintf("Some fields of daemon are not valid: %v", err))
	}

	// Validate fields that cannot be validated by validator engine
	if err = daemon.Validate(); err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprintf("Some fields of daemon are not valid: %v", err))
	}

	// Check that daemon site exists
	if _, err := docktorAPI.Sites().FindByIDBson(daemon.Site); err != nil {
		if err == mgo.ErrNotFound {
			return c.String(http.StatusBadRequest, fmt.Sprint("Site does not exist"))
		}
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Unable to check if site exist. Retry later : %s", err))
	}

	// Keep only existing tags
	daemon.Tags = existingTags(docktorAPI, daemon.Tags)

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

	// TODO: return error when daemon is already used in another service/container
	// If it's used in a filesystem in a group, it's OK, it should be deleted when saving the group

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
