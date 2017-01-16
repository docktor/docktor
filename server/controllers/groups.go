package controllers

import (
	"fmt"
	"net/http"
	"strconv"

	log "github.com/Sirupsen/logrus"
	"github.com/labstack/echo"
	api "github.com/soprasteria/docktor/model"
	"github.com/soprasteria/docktor/model/types"
	"github.com/soprasteria/docktor/server/users"
	"gopkg.in/mgo.v2/bson"
)

// Groups contains all groups handlers
type Groups struct {
}

//GetAll groups from docktor
func (g *Groups) GetAll(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	groups, err := docktorAPI.Groups().FindAll()
	if err != nil {
		return c.String(http.StatusInternalServerError, "Error while retreiving all groups")
	}
	return c.JSON(http.StatusOK, groups)
}

//Save group into docktor
func (g *Groups) Save(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	var group types.Group
	err := c.Bind(&group)

	if err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprintf("Error while binding group: %v", err))
	}

	// If the ID is empty, it's a creation, so generate an object ID
	if group.ID.Hex() == "" {
		group.ID = bson.NewObjectId()
	}

	// Filters the members by existing users
	// This way, group will autofix when user is deleted
	existingMembers := existingMembers(docktorAPI, group.Members)
	group.Members = existingMembers

	res, err := docktorAPI.Groups().Save(group)
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while saving group: %v", err))
	}
	return c.JSON(http.StatusOK, res)
}

// existingMembers return members filters by existing ones
// Checks wether the user actually exists in database
func existingMembers(docktorAPI *api.Docktor, members types.Members) types.Members {

	var existingMembers types.Members

	// Get all real users from members.
	existingUsers, _ := docktorAPI.Users().FindAllByIds(members.GetUsers())

	// x*x Cardinality because no need to overoptimize with maps
	// as we will not have millions of members in a group
	for _, user := range existingUsers {
		for _, member := range members {
			if user.ID == member.User {
				existingMembers = append(existingMembers, member)
			}
		}
	}

	return existingMembers
}

//Delete group into docktor
func (g *Groups) Delete(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	id := c.Param("groupID")
	res, err := docktorAPI.Groups().Delete(bson.ObjectIdHex(id))
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while remove group: %v", err))
	}
	return c.JSON(http.StatusOK, res)
}

//Get group from docktor
func (g *Groups) Get(c echo.Context) error {
	group := c.Get("group").(types.Group)
	return c.JSON(http.StatusOK, group)
}

// GetTags get all tags from a given group
// It is able to get get tags from sub entities (like containers and services if needed)
func (g *Groups) GetTags(c echo.Context) error {
	withServices, _ := strconv.ParseBool(c.QueryParam("services"))     // Get all tags from a given daemon
	withcontainers, _ := strconv.ParseBool(c.QueryParam("containers")) // Get all tags from a given Users

	group := c.Get("group").(types.Group)
	docktorAPI := c.Get("api").(*api.Docktor)

	tagIds := group.Tags

	// Get also tags from container instances of group
	if withcontainers {
		for _, c := range group.Containers {
			tagIds = append(tagIds, c.Tags...)
		}
	}

	// Get also tags from the type of containers (= service)
	if withServices {
		var serviceIds []bson.ObjectId
		// Get services from containers
		for _, c := range group.Containers {
			serviceIds = append(serviceIds, c.ServiceID)
		}
		services, err := docktorAPI.Services().FindAllByIDs(serviceIds)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, err)
		}
		// Get tags from services
		for _, s := range services {
			tagIds = append(tagIds, s.Tags...)
		}
	}

	log.WithFields(log.Fields{"group": group.ID, "tags": tagIds}).Debug("Get all tags from Group")

	tags, err := docktorAPI.Tags().FindAllByIDs(tagIds)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, tags)
}

// GetMembers get all users who are members of the group
func (g *Groups) GetMembers(c echo.Context) error {
	group := c.Get("group").(types.Group)
	docktorAPI := c.Get("api").(*api.Docktor)

	ur := users.Rest{Docktor: docktorAPI}
	users, err := ur.GetUsersFromIds(group.Members.GetUsers())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, users)
}

// GetDaemons get all daemons used on the group (filesystem and containers)
func (g *Groups) GetDaemons(c echo.Context) error {

	group := c.Get("group").(types.Group)
	docktorAPI := c.Get("api").(*api.Docktor)

	var daemonIds []bson.ObjectId

	for _, fs := range group.FileSystems {
		daemonIds = append(daemonIds, fs.Daemon)
	}
	for _, c := range group.Containers {
		daemonIds = append(daemonIds, c.DaemonID)
	}

	daemons, err := docktorAPI.Daemons().FindAllByIds(daemonIds)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, daemons)
}

// GetServices get all services used on the group (service from containers)
func (g *Groups) GetServices(c echo.Context) error {
	group := c.Get("group").(types.Group)
	docktorAPI := c.Get("api").(*api.Docktor)

	var serviceIds []bson.ObjectId
	for _, c := range group.Containers {
		serviceIds = append(serviceIds, c.ServiceID)
	}

	services, err := docktorAPI.Services().FindAllByIDs(serviceIds)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}
	return c.JSON(http.StatusOK, services)
}
