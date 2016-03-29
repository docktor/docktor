package server

import (
	"github.com/gin-gonic/gin"
	"github.com/soprasteria/docktor/server/controllers"
	"github.com/soprasteria/godocktor-api"
	"github.com/spf13/viper"
)

//New instane of the server
func New() {
	api := gin.Default()

	gc := controllers.GroupController{}

	api.GET("/ping", pong)
	api.GET("/groups", docktorAPI, gc.GetAllGroups)
	api.Run() // listen and server on 0.0.0.0:8080
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
