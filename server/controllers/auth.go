package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo"
	"github.com/soprasteria/docktor/server/auth"
	api "github.com/soprasteria/godocktor-api"
	"github.com/spf13/viper"
)

// LoginController contains all login handlers
type LoginController struct {
}

// MyCustomClaims test
type MyCustomClaims struct {
	PublicUser
	jwt.StandardClaims
}

// PublicUser is user data stored on client.
type PublicUser struct {
	Username string `json:"username"`
	Role     string `json:"role"`
}

// Token is a JWT Token
type Token struct {
	ID      string     `json:"id_token,omitempty"`
	Message string     `json:"message,omitempty"`
	User    PublicUser `json:"user,omitempty"`
}

//Login handles the login of a user
func (dc *LoginController) Login(c echo.Context) error {

	// Get input parameters
	username := c.FormValue("username")
	password := c.FormValue("password")

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
			return c.JSON(http.StatusForbidden, Token{Message: "Username or password is wrong"})
		}
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while retreiving user %s", username))
	}

	// Create Token
	user := PublicUser{
		username,
		"admin",
	}

	token, err := createToken(user)
	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error while authenticating user %s", username))
	}

	return c.JSON(http.StatusOK, token)
}

func createToken(user PublicUser) (Token, error) {
	claims := MyCustomClaims{
		user,
		jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Hour * 24 * 7).Unix(),
			Issuer:    "docktor",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(viper.GetString("auth.jwt-secret")))

	if err != nil {
		return Token{}, err
	}

	return Token{ID: signedToken, User: user}, nil
}
