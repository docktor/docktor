package controllers

import (
	"fmt"
	"net/http"

	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo"
	"github.com/soprasteria/docktor/server/auth"
	"github.com/soprasteria/docktor/server/users"
	api "github.com/soprasteria/godocktor-api"
	"gopkg.in/mgo.v2/bson"
)

// UsersController contains all group handlers
type UsersController struct {
}

//GetAllUsers from docktor
func (uc *UsersController) GetAllUsers(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	webservice := users.Rest{Docktor: docktorAPI}
	users, err := webservice.GetAllUserRest()
	if err != nil {
		return c.String(http.StatusInternalServerError, "Error while retreiving all users")
	}
	return c.JSON(http.StatusOK, users)
}

//SaveUser into docktor
func (uc *UsersController) SaveUser(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)

	// Get User from body
	var userRest users.UserRest
	err := c.Bind(&userRest)
	if err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprintf("Error while binding user: %v", err))
	}

	webservice := users.Rest{Docktor: docktorAPI}
	res, err := webservice.SaveUser(userRest)
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while saving user: %v", err))
	}

	return c.JSON(http.StatusOK, res)
}

//DeleteUser into docktor
func (uc *UsersController) DeleteUser(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	id := c.Param("id")
	res, err := docktorAPI.Users().Delete(bson.ObjectIdHex(id))
	if err != nil {
		return c.String(500, fmt.Sprintf("Error while remove user: %v", err))
	}
	return c.JSON(200, res)
}

// Profile returns the profile of the connecter user
func (uc *UsersController) Profile(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	userToken := c.Get("user").(*jwt.Token)

	claims := userToken.Claims.(*MyCustomClaims)

	webservice := users.Rest{Docktor: docktorAPI}
	user, err := webservice.GetUserRest(claims.Username)
	if err != nil {
		return c.String(http.StatusForbidden, auth.ErrInvalidCredentials.Error())
	}

	return c.JSON(http.StatusOK, user)
}
