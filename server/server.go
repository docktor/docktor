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
	"github.com/soprasteria/docktor/server/groups"
	"github.com/soprasteria/docktor/server/services"
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
	tagsC := controllers.Tags{}
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

		tagsAPI := api.Group("/tags")
		{
			tagsAPI.GET("", tagsC.GetAll)
			tagsAPI.POST("", tagsC.Save, isAdmin)
			tagAPI := tagsAPI.Group("/:id")
			{
				tagAPI.Use(isValidID("id"), isAdmin)
				tagAPI.DELETE("", tagsC.Delete)
				tagAPI.PUT("", tagsC.Save)
			}
		}

		sitesAPI := api.Group("/sites")
		{
			sitesAPI.GET("", sitesC.GetAll)
			sitesAPI.POST("/new", sitesC.Save, isAdmin)
			siteAPI := sitesAPI.Group("/:id")
			{
				siteAPI.Use(isValidID("id"), isAdmin)
				siteAPI.DELETE("", sitesC.Delete)
				siteAPI.PUT("", sitesC.Save)
			}
		}

		daemonsAPI := api.Group("/daemons")
		{
			daemonsAPI.GET("", daemonsC.GetAll, isAdmin)
			daemonsAPI.POST("/new", daemonsC.Save, isAdmin)
			daemonAPI := daemonsAPI.Group("/:daemonID")
			{
				daemonAPI.Use(isValidID("daemonID"))
				daemonAPI.GET("", daemonsC.Get, isReadOnlyAdmin, daemons.RetrieveDaemon)
				daemonAPI.DELETE("", daemonsC.Delete, isAdmin)
				daemonAPI.PUT("", daemonsC.Save, isAdmin)
				daemonAPI.GET("/info", daemonsC.GetInfo, isReadOnlyAdmin, redisCache(redisClient), daemons.RetrieveDaemon)
			}
		}

		servicesAPI := api.Group("/services")
		{
			servicesAPI.GET("", servicesC.GetAll)
			servicesAPI.POST("/new", servicesC.Save, isAdmin)
			serviceAPI := servicesAPI.Group("/:serviceID")
			{
				serviceAPI.Use(isValidID("serviceID"), isAdmin)
				serviceAPI.GET("", servicesC.Get, services.RetrieveService)
				serviceAPI.DELETE("", servicesC.Delete)
				serviceAPI.PUT("", servicesC.Save)
			}
		}

		groupsAPI := api.Group("/groups")
		{
			groupsAPI.GET("", groupsC.GetAll)
			groupsAPI.POST("/new", groupsC.Save, isAdmin)
			groupAPI := groupsAPI.Group("/:groupID")
			{
				groupAPI.Use(isValidID("groupID"), isAdmin)
				groupAPI.GET("", groupsC.Get, groups.RetrieveGroup)
				groupAPI.DELETE("", groupsC.Delete)
				groupAPI.PUT("", groupsC.Save)
			}
		}

		usersAPI := api.Group("/users")
		{
			// No "isAdmin" middleware on users because users can delete/modify themselves
			// Rights are implemented in each controller
			usersAPI.GET("", usersC.GetAll)
			userAPI := usersAPI.Group("/:id")
			{
				userAPI.Use(isValidID("id"))
				userAPI.DELETE("", usersC.Delete)
				userAPI.PUT("", usersC.Update)
				userAPI.PUT("/password", usersC.ChangePassword)
			}
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
