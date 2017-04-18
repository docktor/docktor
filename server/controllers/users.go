package controllers

import (
	"fmt"
	"net/http"

	log "github.com/Sirupsen/logrus"
	jwt "github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo"
	api "github.com/soprasteria/docktor/model"
	"github.com/soprasteria/docktor/model/types"
	"github.com/soprasteria/docktor/server/auth"
	"github.com/soprasteria/docktor/server/users"
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

// Update user into docktor
// Only admin and current user is able to update a user
func (u *Users) Update(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	authenticatedUser, err := u.getUserFromToken(c)
	if err != nil {
		return c.String(http.StatusUnauthorized, auth.ErrInvalidCredentials.Error())
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
		return c.String(http.StatusBadRequest, "Invalid user ID. User can not be created with this route. Please register.")
	}

	// Only admin or current user are authorized to modify user
	if authenticatedUser.ID != userRest.ID && !authenticatedUser.IsAdmin() {
		return c.String(http.StatusForbidden, ErrNotAuthorized.Error())
	}

	var email, displayName, firstName, lastName *string
	var role *types.Role
	var tags []bson.ObjectId

	if authenticatedUser.IsAdmin() {
		log.WithFields(log.Fields{
			"newTags": userRest.Tags,
			"newRole": userRest.Role,
		}).Info("Modifying user as Admin")
		// An admin is allowed to modify the following fields
		tags = userRest.Tags
		role = &userRest.Role
	}

	if authenticatedUser.ID == userRest.ID {
		// A user is allowed to modify the following fields from his own profile
		email = &userRest.Email
		displayName = &userRest.DisplayName
		firstName = &userRest.FirstName
		lastName = &userRest.LastName
	}

	webservice := users.Rest{Docktor: docktorAPI}
	res, err := webservice.UpdateUser(userRest.ID, email, displayName, firstName, lastName, role, tags)
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while saving user: %v", err))
	}

	return c.JSON(http.StatusOK, res)
}

//Delete user into docktor
func (u *Users) Delete(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	id := c.Param("id")

	authenticatedUser, err := u.getUserFromToken(c)
	if err != nil {
		return c.String(http.StatusForbidden, auth.ErrInvalidCredentials.Error())
	}

	if authenticatedUser.ID != id && !authenticatedUser.IsAdmin() {
		// Admins can delete any users but user can only delete his own account
		return c.String(http.StatusForbidden, "You do not have rights to delete this user")
	}

	// Delete the user
	res, err := docktorAPI.Users().Delete(bson.ObjectIdHex(id))
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while remove user: %v", err))
	}

	// Remove members on all groups as we delete it
	rmInfo, err := docktorAPI.Groups().RemoveMemberFromAllGroups(bson.ObjectIdHex(id))
	if err != nil {
		log.WithField("info", rmInfo).WithField("userId", id).Warn("Could not remove member from groups after deleting user")
	}

	return c.String(http.StatusOK, res.Hex())
}

// ChangePasswordOptions is a structure containing data used to change a password
// This struct will be unmarshalled from a HTTP request body
type ChangePasswordOptions struct {
	OldPassword string `json:"oldPassword"`
	NewPassword string `json:"newPassword"`
}

// ChangePassword changes the password of a user
func (u *Users) ChangePassword(c echo.Context) error {

	var options ChangePasswordOptions
	err := c.Bind(&options)
	if err != nil {
		return c.String(http.StatusBadRequest, "Body not recognized")
	}

	authenticatedUser, err := u.getUserFromToken(c)
	if err != nil {
		return c.String(http.StatusForbidden, auth.ErrInvalidCredentials.Error())
	}

	id := c.Param("id")
	if authenticatedUser.ID != id {
		return c.String(http.StatusForbidden, "Can't change password of someone else")
	}

	if options.NewPassword == "" || len(options.NewPassword) < 6 {
		return c.String(http.StatusForbidden, "New password should not be empty and be at least 6 characters")
	}

	docktorAPI := c.Get("api").(*api.Docktor)
	webservice := auth.Authentication{Docktor: docktorAPI}
	err = webservice.ChangePassword(authenticatedUser.ID, options.OldPassword, options.NewPassword)

	if err != nil {
		if err == auth.ErrInvalidOldPassword {
			return c.String(http.StatusForbidden, err.Error())
		}
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, "")
}

// Profile returns the profile of the connecter user
func (u *Users) Profile(c echo.Context) error {
	user, err := u.getUserFromToken(c)
	if err != nil {
		return c.String(http.StatusUnauthorized, auth.ErrInvalidCredentials.Error())
	}

	return c.JSON(http.StatusOK, user)
}

//Get user from docktor
func (u *Users) Get(c echo.Context) error {
	// No access control on purpose
	user := c.Get("user").(users.UserRest)
	return c.JSON(http.StatusOK, user)
}

func (u *Users) getUserFromToken(c echo.Context) (users.UserRest, error) {
	docktorAPI := c.Get("api").(*api.Docktor)
	userToken := c.Get("user-token").(*jwt.Token)

	claims := userToken.Claims.(*auth.MyCustomClaims)

	webservice := users.Rest{Docktor: docktorAPI}
	return webservice.GetUserRest(claims.Username)
}
