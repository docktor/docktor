package controllers

import (
	"fmt"
	"net/http"
	"net/mail"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo"
	"github.com/soprasteria/docktor/server/auth"
	"github.com/soprasteria/docktor/server/users"
	api "github.com/soprasteria/godocktor-api"
	"github.com/spf13/viper"
)

// LoginController contains all login handlers
type LoginController struct {
}

// MyCustomClaims contains data that will be signed in the JWT token
type MyCustomClaims struct {
	Username string `json:"username"`
	jwt.StandardClaims
}

// Token is a JWT Token
type Token struct {
	ID   string         `json:"id_token,omitempty"`
	User users.UserRest `json:"user,omitempty"`
}

// Register create an account
func (dc *LoginController) Register(c echo.Context) error {

	// Get form data
	username := c.FormValue("username")
	password := c.FormValue("password")
	email := c.FormValue("email")
	firstname := c.FormValue("firstname")
	lastname := c.FormValue("lastname")

	// Check form data
	if username == "" || strings.Contains(username, " ") {
		return c.String(http.StatusForbidden, "Username should not be empty and should not contains any whitespace")
	}

	if password == "" || len(password) < 6 {
		return c.String(http.StatusForbidden, "Password should not be empty and be at least 6 characters")
	}

	if _, err := mail.ParseAddress(email); err != nil {
		return c.String(http.StatusForbidden, "Email should not be empty and be valid")
	}

	if firstname == "" {
		return c.String(http.StatusForbidden, "Firstname should not be empty")
	}

	if lastname == "" {
		return c.String(http.StatusForbidden, "Lastname should not be empty")
	}

	// Handle APIs from Echo context
	docktorAPI := c.Get("api").(*api.Docktor)
	ldapAPI := c.Get("ldap")
	var ldap *auth.LDAP
	if ldapAPI != nil {
		ldap = ldapAPI.(*auth.LDAP)
	}
	login := auth.Authentication{
		Docktor: docktorAPI,
		LDAP:    ldap,
	}

	// Log in the application
	err := login.RegisterUser(&auth.RegisterUserQuery{
		Username:  username,
		Password:  password,
		Email:     email,
		Firstname: firstname,
		Lastname:  lastname,
	})
	if err != nil {
		fmt.Println(err.Error())
		if err == auth.ErrUsernameAlreadyTaken {
			return c.String(http.StatusForbidden, auth.ErrUsernameAlreadyTaken.Error())
		}
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Generates a valid token
	token, err := createToken(username)
	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Get the user from database
	webservice := users.Rest{Docktor: docktorAPI}
	user, err := webservice.GetUserRest(username)
	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, Token{ID: token, User: user})

}

//Login handles the login of a user
//When user is authorized, it creates a JWT Token https://jwt.io/introduction/ that will be store on client
func (dc *LoginController) Login(c echo.Context) error {

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
	docktorAPI := c.Get("api").(*api.Docktor)
	ldapAPI := c.Get("ldap")
	var ldap *auth.LDAP
	if ldapAPI != nil {
		ldap = ldapAPI.(*auth.LDAP)
	}
	login := auth.Authentication{
		Docktor: docktorAPI,
		LDAP:    ldap,
	}

	// Log in the application
	err := login.AuthenticateUser(&auth.LoginUserQuery{
		Username: username,
		Password: password,
	})
	if err != nil {
		fmt.Println(err.Error())
		if err == auth.ErrInvalidCredentials {
			return c.String(http.StatusForbidden, auth.ErrInvalidCredentials.Error())
		}
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Generates a valid token
	token, err := createToken(username)
	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Get the user from database
	webservice := users.Rest{Docktor: docktorAPI}
	user, err := webservice.GetUserRest(username)
	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, Token{ID: token, User: user})
}

// createToken generates a signed JWT Token from user info and a secret
func createToken(username string) (string, error) {
	claims := MyCustomClaims{
		username,
		jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Hour * 24 * 7).Unix(),
			Issuer:    "docktor",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(viper.GetString("auth.jwt-secret")))

	if err != nil {
		return "", err
	}

	return signedToken, nil
}
