package server

import (
	"html/template"
	"io"
	"net/http"

	redis "gopkg.in/redis.v3"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"github.com/soprasteria/docktor/server/auth"
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
	exportC := controllers.Export{}

	engine.Use(middleware.Logger())
	engine.Use(middleware.Recover())
	engine.Use(middleware.Gzip())

	t := &Template{Templates: template.Must(template.ParseFiles("./client/dist/index.tmpl"))}
	engine.Renderer = t

	engine.GET("/ping", pong)

	authAPI := engine.Group("/auth")
	{
		authAPI.Use(docktorAPI) // Enrich echo context with connexion to Docktor mongo API
		if viper.GetString("ldap.address") != "" {
			authAPI.Use(openLDAP)
		}
		authAPI.POST("/login", authC.Login)
		authAPI.POST("/register", authC.Register)
		authAPI.POST("/reset_password", authC.ResetPassword)              // Reset the forgotten password
		authAPI.POST("/change_reset_password", authC.ChangeResetPassword) // Change password that has been reset
		authAPI.GET("/*", GetIndex(version))
	}

	api := engine.Group("/api")
	{
		api.Use(docktorAPI) // Enrich echo context with connexion to Docktor mongo API
		config := middleware.JWTConfig{
			Claims:     &auth.MyCustomClaims{},
			SigningKey: []byte(viper.GetString("auth.jwt-secret")),
			ContextKey: "user-token",
		}
		api.Use(middleware.JWTWithConfig(config)) // Enrich echo context with JWT
		api.Use(getAuhenticatedUser)              // Enrich echo context with authenticated user (fetched from JWT token)

		api.GET("/profile", usersC.Profile)

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
			// No "isAdmin" middleware on users because users can delete/modify themselves
			// Rights are implemented in each controller
			usersAPI.DELETE("/:id", usersC.Delete)
			usersAPI.PUT("/:id", usersC.Update)
			usersAPI.PUT("/:id/password", usersC.ChangePassword)
			usersAPI.GET("", usersC.GetAll)
		}

		exportAPI := api.Group("/export")
		{
			exportAPI.GET("", exportC.ExportAll, isAdmin)
		}
	}

	engine.Static("/js", "client/dist/js")
	engine.Static("/css", "client/dist/css")
	engine.Static("/images", "client/dist/images")
	engine.Static("/fonts", "client/dist/fonts")

	engine.GET("/*", GetIndex(version))
	if err := engine.Start(":8080"); err != nil {
		engine.Logger.Fatal(err.Error())
	}
}

func pong(c echo.Context) error {

	return c.JSON(http.StatusOK, JSON{
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
