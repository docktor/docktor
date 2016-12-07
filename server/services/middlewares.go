package services

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo"
	api "github.com/soprasteria/docktor/model"
)

// RetrieveService find service using id param and put it in echo.Context
func RetrieveService(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		docktorAPI := c.Get("api").(*api.Docktor)
		serviceID := c.Param("serviceID")
		if serviceID == "" {
			return c.String(http.StatusBadRequest, ServiceInvalidID)
		}
		service, err := docktorAPI.Services().FindByID(serviceID)
		if err != nil {
			return c.String(http.StatusNotFound, fmt.Sprintf(ServiceNotFound, serviceID))
		}
		c.Set("service", service)
		return next(c)
	}
}
