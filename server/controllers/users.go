package controllers

import (
	"fmt"
	"net/http"

	jwt "github.com/dgrijalva/jwt-go"
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

//Update user into docktor
// Only admin and current user is able to update a user
func (u *Users) Update(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	authenticatedUser, err := u.getUserFromToken(c)
	if err != nil {
		return c.String(http.StatusForbidden, auth.ErrInvalidCredentials.Error())
	}

	// Get User from body
	var userRest users.UserRest
	err = c.Bind(&userRest)
	if err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprintf("Error while binding user: %v", err))
	}

	// This route is only for update of existing user.
	// Another route exists for create a new user
	if userRest.ID == "" || userRest.ID == "-1" {
		return c.String(http.StatusBadRequest, "Bad user ID. User can not be created with this route. Please register.")
	}

	// Only admin or current user are authorized to modify user
	if authenticatedUser.ID != userRest.ID && !authenticatedUser.IsAdmin() {
		return c.String(http.StatusForbidden, ErrNotAuthorized.Error())
	}

	webservice := users.Rest{Docktor: docktorAPI}
	res, err := webservice.UpdateUser(userRest)
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
	user, err := u.getUserFromToken(c)
	if err != nil {
		return c.String(http.StatusForbidden, auth.ErrInvalidCredentials.Error())
	}

	return c.JSON(http.StatusOK, user)
}

func (u *Users) getUserFromToken(c echo.Context) (users.UserRest, error) {
	docktorAPI := c.Get("api").(*api.Docktor)
	userToken := c.Get("user-token").(*jwt.Token)

	claims := userToken.Claims.(*MyCustomClaims)

	webservice := users.Rest{Docktor: docktorAPI}
	return webservice.GetUserRest(claims.Username)
}
