package server

import (
	"html/template"
	"io"
	"net/http"

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

	engine.Use(middleware.Logger())
	engine.Use(middleware.Recover())

	t := &Template{Templates: template.Must(template.ParseFiles("./client/dist/index.tmpl"))}
	engine.SetRenderer(t)

	engine.GET("/ping", pong)
	api := engine.Group("/api")
	{
		api.Use(docktorAPI)

		sites := api.Group("/sites")
		{
			sites.DELETE("/:id", sc.DeleteSite)
			sites.PUT("/:id", sc.SaveSite)
			sites.GET("*", sc.GetAllSites)
		}

		daemons := api.Group("/daemons")
		{
			daemons.DELETE("/:id", dc.DeleteDaemon)
			daemons.PUT("/:id", dc.SaveDaemon)
			daemons.GET("*", dc.GetAllDaemons)
		}

		services := api.Group("/services")
		{
			services.DELETE("/:id", sec.DeleteService)
			services.PUT("/:id", sec.SaveService)
			services.GET("*", sec.GetAllServices)
		}

		groups := api.Group("/groups")
		{
			groups.DELETE(":id", gc.DeleteGroup)
			groups.PUT(":id", gc.SaveGroup)
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

	engine.Any("/*", GetIndex(version))
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
