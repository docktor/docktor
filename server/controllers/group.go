package controllers

import (
	"github.com/gin-gonic/gin"
	"github.com/soprasteria/godocktor-api"
)

// GroupController contains all group handlers
type GroupController struct {
}

//GetAllGroups frol docktor
func (gc *GroupController) GetAllGroups(c *gin.Context) {
	api := c.MustGet("api").(*docktor.Docktor)
	groups, err := api.Groups().FindAllByRegex(".*")
	if err != nil {
		c.String(500, "Error while retreiving all groups")
	}
	c.JSON(200, groups)
}
