package daemons

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo"
	api "github.com/soprasteria/godocktor-api"
)

// RetrieveDaemon find daemon using id param and put it in echo.Context
func RetrieveDaemon(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		docktorAPI := c.Get("api").(*api.Docktor)
		daemonID := c.Param("daemonID")
		if daemonID == "" {
			return c.String(http.StatusBadRequest, DaemonInvalidID)
		}
		daemon, err := docktorAPI.Daemons().FindByID(daemonID)
		if err != nil {
			return c.String(http.StatusNotFound, fmt.Sprintf(DaemonNotFound, daemonID))
		}
		c.Set("daemon", daemon)
		return next(c)
	}
}
