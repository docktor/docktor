package server

import (
	"github.com/gin-gonic/gin"
	"github.com/soprasteria/docktor/server/controllers"
	"github.com/soprasteria/godocktor-api"
	"github.com/spf13/viper"
)

//New instane of the server
func New() {
	router := gin.Default()

	sc := controllers.SitesController{}
	dc := controllers.DaemonsController{}
	sec := controllers.ServicesController{}
	gc := controllers.GroupsController{}
	uc := controllers.UsersController{}

	router.GET("/ping", pong)
	api := router.Group("/api")
	{
		sites := api.Group("/sites")
		{
			sites.GET("/", docktorAPI, sc.GetAllSites)
			sites.DELETE("/:id", docktorAPI, sc.DeleteSite)
			sites.PUT("/:id", docktorAPI, sc.SaveSite)
		}

		daemons := api.Group("/daemons")
		{
			daemons.GET("/", docktorAPI, dc.GetAllDaemons)
			daemons.DELETE("/:id", docktorAPI, dc.DeleteDaemon)
			daemons.PUT("/:id", docktorAPI, dc.SaveDaemon)
		}

		services := api.Group("/services")
		{
			services.GET("/", docktorAPI, sec.GetAllServices)
			services.DELETE("/:id", docktorAPI, sec.DeleteService)
			services.PUT("/:id", docktorAPI, sec.SaveService)
		}

		groups := api.Group("/group")
		{
			groups.GET("/", docktorAPI, gc.GetAllGroups)
			groups.DELETE("/:id", docktorAPI, gc.DeleteGroup)
			groups.PUT("/:id", docktorAPI, gc.SaveGroup)
		}

		users := api.Group("/users")
		{
			users.GET("/", docktorAPI, uc.GetAllUsers)
			users.DELETE("/:id", docktorAPI, uc.DeleteUser)
			users.PUT("/:id", docktorAPI, uc.SaveUser)
		}
	}
	router.Run() // listen and server on 0.0.0.0:8080
}

func pong(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "pong",
	})
}

func docktorAPI(c *gin.Context) {
	mongoURL := viper.GetString("server.mongo")
	dock, err := docktor.Open(mongoURL)
	if err != nil {
		panic(err)
	}
	c.Set("api", dock)
	c.Next()
	dock.Close()
}
