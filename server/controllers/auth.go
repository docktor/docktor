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

	username := c.FormValue("username")
	password := c.FormValue("password")

	// TODO : real user search
	if username == "admin" && password == "admin" {
		expireToken := time.Now().Add(time.Hour * 24 * 7).Unix()

		user := PublicUser{
			username,
			"admin",
		}
		claims := MyCustomClaims{
			user,
			jwt.StandardClaims{
				ExpiresAt: expireToken,
				Issuer:    "docktor",
			},
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

		signedToken, _ := token.SignedString([]byte(viper.GetString("jwt.secret")))

		return c.JSON(http.StatusOK, Token{ID: signedToken, User: user})
	} else if username == "user" && password == "user" {
		expireToken := time.Now().Add(time.Hour * 24 * 7).Unix()

		user := PublicUser{
			username,
			"user",
		}
		claims := MyCustomClaims{
			user,
			jwt.StandardClaims{
				ExpiresAt: expireToken,
				Issuer:    "docktor",
			},
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

		signedToken, _ := token.SignedString([]byte(viper.GetString("jwt.secret")))

		return c.JSON(http.StatusOK, Token{ID: signedToken, User: user})
	}

	return c.JSON(http.StatusForbidden, Token{Message: "Username or password is wrong"})

}
