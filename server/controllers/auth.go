package controllers

import (
	"fmt"
	"net/http"
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

// MyCustomClaims test
type MyCustomClaims struct {
	Username string `json:"username"`
	jwt.StandardClaims
}

// Token is a JWT Token
type Token struct {
	ID      string         `json:"id_token,omitempty"`
	Message string         `json:"message,omitempty"`
	User    users.UserRest `json:"user,omitempty"`
}

//Login handles the login of a user
func (dc *LoginController) Login(c echo.Context) error {

	// Get input parameters
	username := c.FormValue("username")
	password := c.FormValue("password")
	if username == "" {
		return c.String(http.StatusInternalServerError, "Username should not be empty")
	}

	if password == "" {
		return c.String(http.StatusInternalServerError, "Password should not be empty")
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
			return c.JSON(http.StatusForbidden, Token{Message: auth.ErrInvalidCredentials.Error()})
		}
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while retreiving user %s", username))
	}

	// Generates a valid token
	token, err := createToken(username)
	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while authenticating user %s", username))
	}

	// Get the user from database
	webservice := users.Rest{Docktor: docktorAPI}
	user, err := webservice.GetUserRest(username)
	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while authenticating user %s", username))
	}

	return c.JSON(http.StatusOK, Token{ID: token, User: user})
}

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
