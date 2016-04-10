package controllers

import (
	"github.com/gin-gonic/gin"
	api "github.com/soprasteria/godocktor-api"
	"github.com/soprasteria/godocktor-api/types"
	"gopkg.in/mgo.v2/bson"
)

// SitesController contains all group handlers
type SitesController struct {
}

//GetAllSites from docktor
func (sc *SitesController) GetAllSites(c *gin.Context) {
	docktorAPI := c.MustGet("api").(*api.Docktor)
	sites, err := docktorAPI.Sites().FindAll()
	if err != nil {
		c.String(500, "Error while retreiving all sites")
		return
	}
	c.JSON(200, sites)
}

//SaveSite into docktor
func (sc *SitesController) SaveSite(c *gin.Context) {
	docktorAPI := c.MustGet("api").(*api.Docktor)
	var site types.Site
	err := c.Bind(&site)

	if err != nil {
		c.String(400, "Error while binding site: %v", err)
	}
	res, err := docktorAPI.Sites().Save(site)
	if err != nil {
		c.String(500, "Error while saving site: %v", err)
		return
	}
	c.JSON(200, res)

}

//DeleteSite into docktor
func (sc *SitesController) DeleteSite(c *gin.Context) {
	docktorAPI := c.MustGet("api").(*api.Docktor)
	id := c.Param("id")
	res, err := docktorAPI.Sites().Delete(bson.ObjectIdHex(id))
	if err != nil {
		c.String(500, "Error while remove site: %v", err)
		return
	}
	c.JSON(200, res)
}
