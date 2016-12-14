package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"net/mail"
	"strings"

	log "github.com/Sirupsen/logrus"
	"github.com/labstack/echo"
	api "github.com/soprasteria/docktor/model"
	"github.com/soprasteria/docktor/server/auth"
	"github.com/soprasteria/docktor/server/users"
)

// Auth contains all login handlers
type Auth struct {
}

// Token is a JWT Token
type Token struct {
	ID   string         `json:"id_token,omitempty"`
	User users.UserRest `json:"user,omitempty"`
}

func newAuthAPI(c echo.Context) auth.Authentication {
	// Handle APIs from Echo context
	docktorAPI := c.Get("api").(*api.Docktor)
	ldapAPI := c.Get("ldap")
	var ldap *auth.LDAP
	if ldapAPI != nil {
		ldap = ldapAPI.(*auth.LDAP)
	}
	return auth.Authentication{
		Docktor: docktorAPI,
		LDAP:    ldap,
	}
}

func checkParametersRegister(username, password, email, firstname, lastname string) error {
	// Check form data
	if username == "" || strings.Contains(username, " ") {
		return errors.New("Username should not be empty and should not contains any whitespace")
	}

	if password == "" || len(password) < 6 {
		return errors.New("Password should not be empty and be at least 6 characters")
	}

	if _, err := mail.ParseAddress(email); err != nil {
		return errors.New("Email should not be empty and be valid")
	}

	if firstname == "" {
		return errors.New("Firstname should not be empty")
	}

	if lastname == "" {
		return errors.New("Lastname should not be empty")
	}

	return nil
}

// Register create an account
func (a *Auth) Register(c echo.Context) error {

	// Get form data
	username := c.FormValue("username")
	password := c.FormValue("password")
	email := c.FormValue("email")
	firstname := c.FormValue("firstname")
	lastname := c.FormValue("lastname")

	// Check form data
	if err := checkParametersRegister(username, password, email, firstname, lastname); err != nil {
		return c.String(http.StatusForbidden, err.Error())
	}

	// Handle APIs from Echo context
	login := newAuthAPI(c)

	// Log in the application
	err := login.RegisterUser(&auth.RegisterUserQuery{
		Username:  username,
		Password:  password,
		Email:     email,
		Firstname: firstname,
		Lastname:  lastname,
	})
	if err != nil {
		log.WithError(err).WithField("user", username).Error("User registration failed")
		if err == auth.ErrUsernameAlreadyTaken {
			return c.String(http.StatusForbidden, auth.ErrUsernameAlreadyTaken.Error())
		}
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Generates a valid token
	token, err := login.CreateLoginToken(username)
	if err != nil {
		log.WithError(err).WithField("user", username).Error("Login token creation failed")
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Get the user from database
	webservice := users.Rest{Docktor: login.Docktor}
	user, err := webservice.GetUserRest(username)
	if err != nil {
		log.WithError(err).WithField("username", username).Error("User retrieval failed")
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, Token{ID: token, User: user})

}

//Login handles the login of a user
//When user is authorized, it creates a JWT Token https://jwt.io/introduction/ that will be store on client
func (a *Auth) Login(c echo.Context) error {
	// Get input parameters
	username := c.FormValue("username")
	password := c.FormValue("password")

	// Check input parameters
	if username == "" {
		return c.String(http.StatusForbidden, "Username should not be empty")
	}

	if password == "" {
		return c.String(http.StatusForbidden, "Password should not be empty")
	}

	// Handle APIs from Echo context
	login := newAuthAPI(c)

	// Log in the application
	err := login.AuthenticateUser(&auth.LoginUserQuery{
		Username: username,
		Password: password,
	})
	if err != nil {
		log.WithError(err).WithField("user", username).Error("User authentication failed")
		if err == auth.ErrInvalidCredentials {
			return c.String(http.StatusForbidden, auth.ErrInvalidCredentials.Error())
		}
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Generates a valid token
	token, err := login.CreateLoginToken(username)
	if err != nil {
		log.WithError(err).WithField("user", username).Error("Login token creation failed")
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Get the user from database
	webservice := users.Rest{Docktor: login.Docktor}
	user, err := webservice.GetUserRest(username)
	if err != nil {
		log.WithError(err).WithField("username", username).Error("User retrieval failed")
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, Token{ID: token, User: user})
}

//ResetPassword handles resets the password of someone
//When user reset his password, it generates an email to this person with a link to change his.
func (a *Auth) ResetPassword(c echo.Context) error {
	// Get input parameters

	//TODO : email et/ou username
	username := c.FormValue("username")

	// Check input parameters
	if username == "" {
		return c.String(http.StatusForbidden, "Username should not be empty")
	}

	// Handle APIs from Echo context
	login := newAuthAPI(c)

	// Reset the password in DB
	user, err := login.ResetPasswordUser(username)
	if err != nil {
		return c.String(http.StatusForbidden, err.Error())
	}
	// Create a token that will be used for URL
	token, err := login.CreateResetPasswordToken(user.Username)
	if err != nil {
		return c.String(http.StatusInternalServerError, "Can't generate URL for password change")
	}

	var protocol = "http"
	if c.Request().TLS != nil {
		protocol = "https"
	}

	url := fmt.Sprintf("%s://%s/change_reset_password?token=%s", protocol, c.Request().Host, token)
	go auth.SendResetPasswordEmail(user, url)

	return c.JSON(http.StatusOK, "OK")
}

//ChangeResetPassword changes the password of someone that reset it before
//When user changes the password, he's automatically connected
func (a *Auth) ChangeResetPassword(c echo.Context) error {
	// Get input parameters

	newPassword := c.FormValue("newPassword")
	token := c.FormValue("token")

	// Check input parameters
	if newPassword == "" {
		return c.String(http.StatusForbidden, "NewPassword should not be empty")
	}

	if token == "" {
		return c.String(http.StatusForbidden, "Token should not be empty")
	}

	// Handle APIs from Echo context
	login := newAuthAPI(c)

	// Change the password of the user in DB
	user, err := login.ChangeResetPasswordUser(token, newPassword)
	if err != nil {
		return c.String(http.StatusForbidden, err.Error())
	}

	// Generates a valid token
	authenticationToken, err := login.CreateLoginToken(user.Username)
	if err != nil {
		log.WithError(err).WithField("user", user.Username).Error("Login token creation failed")
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Get the user from database
	webservice := users.Rest{Docktor: login.Docktor}
	userRest, err := webservice.GetUserRest(user.Username)
	if err != nil {
		log.WithError(err).WithField("username", user.Username).Error("User retrieval failed")
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, Token{ID: authenticationToken, User: userRest})
}
