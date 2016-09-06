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

// Users contains all group handlers
type Users struct {
}

//GetAll users from docktor
func (u *Users) GetAll(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	webservice := users.Rest{Docktor: docktorAPI}
	users, err := webservice.GetAllUserRest()
	if err != nil {
		return c.String(http.StatusInternalServerError, "Error while retreiving all users")
	}
	return c.JSON(http.StatusOK, users)
}

//Save user into docktor
func (u *Users) Save(c echo.Context) error {
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

//Delete user into docktor
func (u *Users) Delete(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	id := c.Param("id")
	res, err := docktorAPI.Users().Delete(bson.ObjectIdHex(id))
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while remove user: %v", err))
	}
	return c.JSON(http.StatusOK, res)
}

// Profile returns the profile of the connecter user
func (u *Users) Profile(c echo.Context) error {
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
