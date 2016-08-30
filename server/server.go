package server

import (
	"html/template"
	"io"
	"net/http"

	"gopkg.in/redis.v3"

	"github.com/labstack/echo"
	"github.com/labstack/echo/engine/standard"
	"github.com/labstack/echo/middleware"
	"github.com/soprasteria/docktor/server/controllers"
	"github.com/soprasteria/docktor/server/daemons"
	"github.com/spf13/viper"
)

// JSON type
type JSON map[string]interface{}

// Template : template struct
type Template struct {
	Templates *template.Template
}

// Render : render template
func (t *Template) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	return t.Templates.ExecuteTemplate(w, name, data)
}

//New instane of the server
func New(version string) {

	redisClient := redis.NewClient(&redis.Options{
		Addr:     viper.GetString("redis.addr"),
		Password: viper.GetString("redis.password"), // no password set
		DB:       0,                                 // use default DB
	})

	engine := echo.New()
	sitesC := controllers.Sites{}
	daemonsC := controllers.Daemons{}
	servicesC := controllers.Services{}
	groupsC := controllers.Groups{}
	usersC := controllers.Users{}
	authC := controllers.Auth{}

	engine.Use(middleware.Logger())
	engine.Use(middleware.Recover())
	engine.Use(middleware.Gzip())

	t := &Template{Templates: template.Must(template.ParseFiles("./client/dist/index.tmpl"))}
	engine.SetRenderer(t)

	engine.GET("/ping", pong)

	auth := engine.Group("/auth")
	{
		auth.Use(docktorAPI) // Enrich echo context with connexion to Docktor mongo API
		auth.Use(openLDAP)
		auth.POST("/login", authC.Login)
		auth.POST("/register", authC.Register)
		auth.GET("/*", GetIndex(version))
	}

	api := engine.Group("/api")
	{
		api.Use(docktorAPI) // Enrich echo context with connexion to Docktor mongo API
		config := middleware.JWTConfig{
			Claims:     &controllers.MyCustomClaims{},
			SigningKey: []byte(viper.GetString("auth.jwt-secret")),
		}
		api.Use(middleware.JWTWithConfig(config)) // Enrich echo context with JWT

		profileAPI := api.Group("/profile")
		{
			profileAPI.GET("", usersC.Profile)
		}

		sitesAPI := api.Group("/sites")
		{
			sitesAPI.DELETE("/:id", sitesC.Delete, isAdmin)
			sitesAPI.PUT("/:id", sitesC.Save, isAdmin)
			sitesAPI.GET("", sitesC.GetAll)
		}

		daemonsAPI := api.Group("/daemons")
		{
			daemonsAPI.GET("", daemonsC.GetAll, isAdmin)
			daemonsAPI.PUT("/:daemonID", daemonsC.Save, isAdmin)
			daemonsAPI.DELETE("/:daemonID", daemonsC.Delete, isAdmin)

			daemonAPI := daemonsAPI.Group("/:daemonID")
			{
				daemonAPI.Use(isAdmin)
				daemonAPI.GET("", daemonsC.Get, daemons.RetrieveDaemon)
				daemonAPI.DELETE("", daemonsC.Delete)
				daemonAPI.PUT("", daemonsC.Save)
				daemonAPI.GET("/info", daemonsC.GetInfo, redisCache(redisClient), daemons.RetrieveDaemon)
			}
		}

		servicesAPI := api.Group("/services")
		{
			servicesAPI.DELETE("/:id", servicesC.Delete, isAdmin)
			servicesAPI.PUT("/:id", servicesC.Save, isAdmin)
			servicesAPI.GET("", servicesC.GetAll)
		}

		groupsAPI := api.Group("/groups")
		{
			groupsAPI.DELETE(":id", groupsC.Delete, isAdmin)
			groupsAPI.PUT(":id", groupsC.Save, isAdmin)
			groupsAPI.GET("", groupsC.GetAll)
		}

		usersAPI := api.Group("/users")
		{
			usersAPI.DELETE("/:id", usersC.Delete, isAdmin)
			usersAPI.PUT("/:id", usersC.Save, isAdmin)
			usersAPI.GET("", usersC.GetAll)
		}
	}

	engine.Static("/js", "client/dist/js")
	engine.Static("/css", "client/dist/css")
	engine.Static("/images", "client/dist/images")
	engine.Static("/fonts", "client/dist/fonts")

	engine.GET("/*", GetIndex(version))
	engine.Run(standard.New(":8080")) // listen and server on 0.0.0.0:8080
}

func pong(c echo.Context) error {
	return c.JSON(200, JSON{
		"message": "pong",
	})
}

// GetIndex handler which render the index.html of mom
func GetIndex(version string) echo.HandlerFunc {
	return func(c echo.Context) error {
		data := make(map[string]interface{})
		data["Version"] = version
		return c.Render(http.StatusOK, "index", data)
	}
}
