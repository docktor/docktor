package server

import (
	"fmt"
	"net/http"

	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo"
	"github.com/soprasteria/docktor/server/auth"
	"github.com/soprasteria/docktor/server/controllers"
	"github.com/soprasteria/docktor/server/users"
	api "github.com/soprasteria/godocktor-api"
	"github.com/spf13/viper"
)

func docktorAPI(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		mongoURL := viper.GetString("server.mongo")
		dock, err := api.Open(mongoURL)
		if err != nil {
			c.Error(err)
		}
		c.Set("api", dock)
		if err := next(c); err != nil {
			c.Error(err)
		}
		dock.Close()
		return nil
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

func isAdmin(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Get api from context
		userToken := c.Get("user").(*jwt.Token)
		docktorAPI := c.Get("api").(*api.Docktor)

		// Parse the token
		claims := userToken.Claims.(*controllers.MyCustomClaims)

		// Get the user from database
		webservice := users.Rest{Docktor: docktorAPI}
		user, err := webservice.GetUserRest(claims.Username)
		if err != nil {
			return c.String(http.StatusForbidden, fmt.Sprintf("API not authorized for user %q", claims.Username))
		}

		// Go on if admin
		if user.Role == users.AdminRole {
			return next(c)
		}

		// Refuse connection otherwise
		return c.String(http.StatusForbidden, fmt.Sprintf("API not authorized for user %q", claims.Username))

	}
}
