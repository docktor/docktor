package controllers

import (
	"net/http"

	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo"
)

// ProfileController contains all login handlers
type ProfileController struct {
}

// Profile returns the
func (dc *ProfileController) Profile(c echo.Context) error {
	user := c.Get("user").(*jwt.Token)
	claims := user.Claims.(*MyCustomClaims)
	return c.JSON(http.StatusOK, claims.PublicUser)
}
