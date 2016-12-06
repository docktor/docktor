package server

import (
	"fmt"
	"net/http"

	"github.com/dgrijalva/jwt-go"

	"github.com/labstack/echo"
	api "github.com/soprasteria/docktor/model"
	"github.com/soprasteria/docktor/model/types"
	"github.com/soprasteria/docktor/server/auth"
	"github.com/soprasteria/docktor/server/users"
	"github.com/spf13/viper"
	"gopkg.in/redis.v3"
)

func redisCache(client *redis.Client) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Set("redis", client)
			return next(c)
		}
	}
}

func docktorAPI(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		mongoURL := viper.GetString("server.mongo")
		dock, err := api.Open(mongoURL)
		if err != nil {
			c.Error(err)
		}
		c.Set("api", dock)
		defer dock.Close()
		return next(c)
	}
}

func openLDAP(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		address := viper.GetString("ldap.address")
		baseDN := viper.GetString("ldap.baseDN")
		bindDN := viper.GetString("ldap.bindDN")
		bindPassword := viper.GetString("ldap.bindPassword")
		searchFilter := viper.GetString("ldap.searchFilter")
		usernameAttribute := viper.GetString("ldap.attr.username")
		firstnameAttribute := viper.GetString("ldap.attr.firstname")
		lastnameAttribute := viper.GetString("ldap.attr.lastname")
		realNameAttribute := viper.GetString("ldap.attr.realname")
		emailAttribute := viper.GetString("ldap.attr.email")

		if address == "" {
			// Don't use LDAP, no problem
			fmt.Println("Init route without LDAP connection")
			c.Logger().Info("Init route without LDAP connection")
			return next(c)
		}

		// Enrich the echo context with LDAP configuration
		fmt.Println("Init route with LDAP connection")
		c.Logger().Info("Init route with LDAP connection")

		ldap := auth.NewLDAP(&auth.LDAPConf{
			LdapServer:   address,
			BaseDN:       baseDN,
			BindDN:       bindDN,
			BindPassword: bindPassword,
			SearchFilter: searchFilter,
			Attr: auth.Attributes{
				Username:  usernameAttribute,
				Firstname: firstnameAttribute,
				Lastname:  lastnameAttribute,
				Realname:  realNameAttribute,
				Email:     emailAttribute,
			},
		})

		c.Set("ldap", ldap)

		return next(c)

	}
}

func getAuhenticatedUser(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Get api from context
		userToken := c.Get("user-token").(*jwt.Token)
		docktorAPI := c.Get("api").(*api.Docktor)

		// Parse the token
		claims := userToken.Claims.(*auth.MyCustomClaims)

		// Get the user from database
		webservice := users.Rest{Docktor: docktorAPI}
		user, err := webservice.GetUserRest(claims.Username)
		if err != nil {
			// Will logout the user automatically, as server considers the token to be invalid
			return c.String(http.StatusUnauthorized, fmt.Sprintf("Your account %q has been removed. Please create a new one.", claims.Username))
		}

		c.Set("user", user)

		return next(c)

	}
}

func isAdmin(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Get user from context
		user := c.Get("user").(users.UserRest)

		// Go on if admin
		if user.Role == types.AdminRole {
			return next(c)
		}

		// Refuse connection otherwise
		return c.String(http.StatusForbidden, fmt.Sprintf("API not authorized for user %q", user.Username))

	}
}
