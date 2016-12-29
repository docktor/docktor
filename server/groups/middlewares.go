package groups

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo"
	api "github.com/soprasteria/docktor/model"
)

// RetrieveGroup find group using id param and put it in echo.Context
func RetrieveGroup(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		docktorAPI := c.Get("api").(*api.Docktor)
		groupID := c.Param("groupID")
		if groupID == "" {
			return c.String(http.StatusBadRequest, GroupInvalidID)
		}
		group, err := docktorAPI.Groups().FindByID(groupID)
		if err != nil {
			return c.String(http.StatusNotFound, fmt.Sprintf(GroupNotFound, groupID))
		}
		c.Set("group", group)
		return next(c)
	}
}
