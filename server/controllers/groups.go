package controllers

import (
	"github.com/gin-gonic/gin"
	api "github.com/soprasteria/godocktor-api"
	"github.com/soprasteria/godocktor-api/types"
	"gopkg.in/mgo.v2/bson"
)

// GroupsController contains all groups handlers
type GroupsController struct {
}

//GetAllGroups from docktor
func (gc *GroupsController) GetAllGroups(c *gin.Context) {
	docktorAPI := c.MustGet("api").(*api.Docktor)
	groups, err := docktorAPI.Groups().FindAll()
	if err != nil {
		c.String(500, "Error while retreiving all groups")
		return
	}
	c.JSON(200, groups)
}

//SaveGroup into docktor
func (gc *GroupsController) SaveGroup(c *gin.Context) {
	docktorAPI := c.MustGet("api").(*api.Docktor)
	var group types.Group
	err := c.Bind(&group)

	if err != nil {
		c.String(400, "Error while binding group: %v", err)
	}
	res, err := docktorAPI.Groups().Save(group)
	if err != nil {
		c.String(500, "Error while saving group: %v", err)
		return
	}
	c.JSON(200, res)

}

//DeleteGroup into docktor
func (gc *GroupsController) DeleteGroup(c *gin.Context) {
	docktorAPI := c.MustGet("api").(*api.Docktor)
	id := c.Param("id")
	res, err := docktorAPI.Groups().Delete(bson.ObjectIdHex(id))
	if err != nil {
		c.String(500, "Error while remove group: %v", err)
		return
	}
	c.JSON(200, res)
}
