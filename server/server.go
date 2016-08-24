package server

import (
	"fmt"
	"html/template"
	"io"
	"net/http"

	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo"
	"github.com/labstack/echo/engine/standard"
	"github.com/labstack/echo/middleware"
	"github.com/soprasteria/docktor/server/controllers"
	"github.com/soprasteria/godocktor-api"
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
	engine := echo.New()
	sc := controllers.SitesController{}
	dc := controllers.DaemonsController{}
	sec := controllers.ServicesController{}
	gc := controllers.GroupsController{}
	uc := controllers.UsersController{}
	lc := controllers.LoginController{}
	p := controllers.ProfileController{}

	engine.Use(middleware.Logger())
	engine.Use(middleware.Recover())
	engine.Use(middleware.Gzip())

	t := &Template{Templates: template.Must(template.ParseFiles("./client/dist/index.tmpl"))}
	engine.SetRenderer(t)

	engine.GET("/ping", pong)

	login := engine.Group("/create-token")
	{
		login.Use(docktorAPI) // Enrich echo context with connexion to Docktor mongo API
		login.POST("*", lc.Login)
	}

	api := engine.Group("/api")
	{
		api.Use(docktorAPI) // Enrich echo context with connexion to Docktor mongo API
		config := middleware.JWTConfig{
			Claims:     &controllers.MyCustomClaims{},
			SigningKey: []byte(viper.GetString("auth.jwt-secret")),
		}
		api.Use(middleware.JWTWithConfig(config)) // Enrich echo context with JWT

		profile := api.Group("/profile")
		{
			profile.GET("*", p.Profile)
		}

		sites := api.Group("/sites")
		{
			sites.DELETE("/:id", sc.DeleteSite, isAdmin)
			sites.PUT("/:id", sc.SaveSite, isAdmin)
			sites.GET("*", sc.GetAllSites)
		}

		daemons := api.Group("/daemons")
		{
			daemons.DELETE("/:id", dc.DeleteDaemon, isAdmin)
			daemons.PUT("/:id", dc.SaveDaemon, isAdmin)
			daemons.GET("*", dc.GetAllDaemons)
		}

		services := api.Group("/services")
		{
			services.DELETE("/:id", sec.DeleteService, isAdmin)
			services.PUT("/:id", sec.SaveService, isAdmin)
			services.GET("*", sec.GetAllServices)
		}

		groups := api.Group("/groups")
		{
			groups.DELETE(":id", gc.DeleteGroup, isAdmin)
			groups.PUT(":id", gc.SaveGroup, isAdmin)
			groups.GET("*", gc.GetAllGroups)
		}

		users := api.Group("/users")
		{
			users.DELETE("/:id", uc.DeleteUser)
			users.PUT("/:id", uc.SaveUser)
			users.GET("*", uc.GetAllUsers)
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

func docktorAPI(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		mongoURL := viper.GetString("server.mongo")
		dock, err := docktor.Open(mongoURL)
		if err != nil {
			c.Error(err)
		}
		c.Set("api", dock)
		if err := next(c); err != nil {
			c.Error(err)
		}
		dock.Close()
		return nil
	}
}

func isAdmin(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		user := c.Get("user").(*jwt.Token)
		claims := user.Claims.(*controllers.MyCustomClaims)
		role := claims.Role

		if role == "admin" {
			return next(c)
		}

		return c.String(http.StatusForbidden, fmt.Sprintf("API not authorized for user %q", claims.Username))

	}
}
