package users

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo"
	api "github.com/soprasteria/docktor/model"
)

// RetrieveUser find user using id param and put it in echo.Context
func RetrieveUser(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		docktorAPI := c.Get("api").(*api.Docktor)
		id := c.Param("id")
		if id == "" {
			return c.String(http.StatusBadRequest, UserInvalidID)
		}
		user, err := docktorAPI.Users().FindByID(id)
		if err != nil {
			return c.String(http.StatusNotFound, fmt.Sprintf(UserNotFound, id))
		}

		c.Set("user", GetUserRest(user))
		return next(c)
	}
}
