package server

import (
	"net/http"
	"sort"
	"strings"

	log "github.com/sirupsen/logrus"
	redis "gopkg.in/redis.v3"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"github.com/soprasteria/docktor/server/controllers"
	"github.com/soprasteria/docktor/server/models"
	"github.com/soprasteria/docktor/server/modules/auth"
	"github.com/soprasteria/docktor/server/modules/daemons"
	"github.com/soprasteria/docktor/server/modules/groups"
	"github.com/soprasteria/docktor/server/modules/services"
	"github.com/soprasteria/docktor/server/modules/users"
	"github.com/soprasteria/docktor/server/types"
	"github.com/spf13/viper"
)

// JSON type
type JSON map[string]interface{}

//New instane of the server
func New() {
	redisClient := redis.NewClient(&redis.Options{
		Addr:     viper.GetString("server.redis.addr"),
		Password: viper.GetString("server.redis.password"), // no password set
		DB:       0,                                        // use default DB
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
	engine.Validator = newValidator() // Use custom validator to check field entities, base on tags

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
		authAPI.GET("/*", GetIndex)
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
			tagsAPI.POST("", tagsC.Save, hasRole(types.AdminRole))
			tagAPI := tagsAPI.Group("/:id")
			{
				tagAPI.Use(isValidID("id"), hasRole(types.AdminRole))
				tagAPI.DELETE("", tagsC.Delete)
				tagAPI.PUT("", tagsC.Save, hasRole(types.AdminRole))
			}
		}

		sitesAPI := api.Group("/sites")
		{
			sitesAPI.GET("", sitesC.GetAll)
			sitesAPI.POST("/new", sitesC.Save, hasRole(types.AdminRole))
			siteAPI := sitesAPI.Group("/:siteID")
			{
				siteAPI.Use(isValidID("siteID"), hasRole(types.AdminRole))
				siteAPI.DELETE("", sitesC.Delete)
				siteAPI.PUT("", sitesC.Save)
			}
		}

		daemonsAPI := api.Group("/daemons")
		{
			daemonsAPI.GET("", daemonsC.GetAll, hasRole(types.AdminRole))
			daemonsAPI.POST("/new", daemonsC.Save, hasRole(types.AdminRole))
			daemonAPI := daemonsAPI.Group("/:daemonID")
			{
				daemonAPI.Use(isValidID("daemonID"))
				daemonAPI.GET("", daemonsC.Get, daemons.RetrieveDaemon)
				daemonAPI.DELETE("", daemonsC.Delete, hasRole(types.AdminRole))
				daemonAPI.PUT("", daemonsC.Save, hasRole(types.AdminRole))
				daemonAPI.GET("/info", daemonsC.GetInfo, redisCache(redisClient), daemons.RetrieveDaemon)
			}
		}

		servicesAPI := api.Group("/services")
		{
			servicesAPI.GET("", servicesC.GetAll)
			servicesAPI.POST("/new", servicesC.Save, hasRole(types.AdminRole))
			serviceAPI := servicesAPI.Group("/:serviceID")
			{
				serviceAPI.Use(isValidID("serviceID"), hasRole(types.AdminRole))
				serviceAPI.GET("", servicesC.Get, services.RetrieveService)
				serviceAPI.DELETE("", servicesC.Delete)
				serviceAPI.PUT("", servicesC.Save)
			}
		}

		groupsAPI := api.Group("/groups")
		{
			groupsAPI.GET("", groupsC.GetAll)
			groupsAPI.POST("/new", groupsC.Save, hasRole(types.AdminRole))
			groupAPI := groupsAPI.Group("/:groupID")
			{
				groupAPI.Use(isValidID("groupID"), hasRole(types.AdminRole))
				groupAPI.GET("", groupsC.Get, groups.RetrieveGroup)
				groupAPI.GET("/tags", groupsC.GetTags, groups.RetrieveGroup)
				groupAPI.GET("/members", groupsC.GetMembers, groups.RetrieveGroup)
				groupAPI.GET("/daemons", groupsC.GetDaemons, groups.RetrieveGroup)
				groupAPI.GET("/services", groupsC.GetServices, groups.RetrieveGroup)
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
				userAPI.GET("", usersC.Get, users.RetrieveUser)
				userAPI.DELETE("", usersC.Delete)
				userAPI.PUT("", usersC.Update)
				userAPI.PUT("/password", usersC.ChangePassword)
			}
		}

		exportAPI := api.Group("/export")
		{
			exportAPI.GET("", exportC.ExportAll, hasRole(types.AdminRole))
		}
	}

	engine.Static("/js", "client/dist/js")
	engine.Static("/css", "client/dist/css")
	engine.Static("/images", "client/dist/images")
	engine.Static("/fonts", "client/dist/fonts")

	engine.GET("/*", GetIndex)
	engine.HideBanner = true

	if log.GetLevel() == log.DebugLevel {
		displayAvailableRoutes(engine.Routes())
	}

	createIndexes()

	log.Info("Server started on port 8080")
	if err := engine.Start(":8080"); err != nil {
		log.WithError(err).Fatal("Can't start server")
		engine.Logger.Fatal(err.Error())
	}
}

func createIndexes() {
	dock, err := models.Get()
	if err != nil {
		log.WithError(err).Fatal("Can't ensure that indexes are created")
		return
	}
	defer dock.Close()
	for _, db := range dock.Collections() {
		if dbWithIndex, ok := db.(models.IsCollectionWithIndexes); ok {
			log.Debugf("Ensuring indexes creating for '%v' collection", db.GetCollectionName())
			err := dbWithIndex.CreateIndexes()
			if err != nil {
				log.WithError(err).Error("Cannot create index")
			}
		}
	}
}

func pong(c echo.Context) error {

	return c.JSON(http.StatusOK, JSON{
		"message": "pong",
	})
}

// GetIndex handler which render the index.html of mom
func GetIndex(c echo.Context) error {
	return c.File("client/dist/index.html")
}

// ByRoutePath is a sortable type meant to sort Echo routes by path, then by HTTP method
type ByRoutePath []*echo.Route

func (a ByRoutePath) Len() int      { return len(a) }
func (a ByRoutePath) Swap(i, j int) { a[i], a[j] = a[j], a[i] }
func (a ByRoutePath) Less(i, j int) bool {
	ai := a[i]
	aj := a[j]
	if ai.Path == aj.Path {
		return ai.Method < aj.Method
	}
	return ai.Path < aj.Path
}

func displayAvailableRoutes(routes []*echo.Route) {
	sort.Sort(ByRoutePath(routes))
	for _, r := range routes {
		if strings.Contains(r.Name, "controllers") {
			log.Debugf("Available API route - %-7v:%v", r.Method, r.Path)
		}
	}
}
