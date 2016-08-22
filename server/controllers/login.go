package controllers

import (
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo"
	"github.com/spf13/viper"
)

// LoginController contains all login handlers
type LoginController struct {
}

// MyCustomClaims test
type MyCustomClaims struct {
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.StandardClaims
}

// Token is a JWT Token
type Token struct {
	ID      string `json:"id_token,omitempty"`
	Message string `json:"message,omitempty"`
}

//Login handles the login of a user
func (dc *LoginController) Login(c echo.Context) error {

	username := c.FormValue("username")
	password := c.FormValue("password")

	// TODO : real user search
	if username == "admin" && password == "admin" {
		expireToken := time.Now().Add(time.Hour * 24 * 7).Unix()

		claims := MyCustomClaims{
			username,
			"admin",
			jwt.StandardClaims{
				ExpiresAt: expireToken,
				Issuer:    "docktor",
			},
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

		signedToken, _ := token.SignedString([]byte(viper.GetString("jwt.secret")))

		return c.JSON(http.StatusOK, Token{ID: signedToken})
	} else if username == "user" && password == "user" {
		expireToken := time.Now().Add(time.Hour * 24 * 7).Unix()

		claims := MyCustomClaims{
			username,
			"user",
			jwt.StandardClaims{
				ExpiresAt: expireToken,
				Issuer:    "docktor",
			},
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

		signedToken, _ := token.SignedString([]byte(viper.GetString("jwt.secret")))

		return c.JSON(http.StatusOK, Token{ID: signedToken})
	}

	return c.JSON(http.StatusForbidden, Token{Message: "Username or password is wrong"})

}
