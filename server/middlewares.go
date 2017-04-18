package server

import (
	"fmt"
	"net/http"

	"github.com/dgrijalva/jwt-go"

	log "github.com/Sirupsen/logrus"
	"github.com/labstack/echo"
	api "github.com/soprasteria/docktor/model"
	"github.com/soprasteria/docktor/model/types"
	"github.com/soprasteria/docktor/server/auth"
	"github.com/soprasteria/docktor/server/users"
	"github.com/spf13/viper"
	"gopkg.in/mgo.v2/bson"
	"gopkg.in/redis.v3"
)

// NotAuthorized is a template string used to report an unauthorized access to the API
var NotAuthorized = "API not authorized for user %q"

// NotValidID is a template string used to report that the id is not valid (i.e. not a valid BSON ID)
var NotValidID = "ID %q is not valid"

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
		dock, err := api.Get()
		if err != nil {
			c.Error(err)
		}
		defer dock.Close()
		c.Set("api", dock)
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
			log.Info("No LDAP configured")
			return next(c)
		}

		// Enrich the echo context with LDAP configuration
		log.Info("LDAP configured")

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

		c.Set("authuser", user)

		return next(c)

	}
}

// hasRole is a middleware checking if the currently authenticated users has sufficient privileges to reach a route
func hasRole(role types.Role) func(next echo.HandlerFunc) echo.HandlerFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Get user from context
			user := c.Get("authuser").(users.UserRest)

			// Check if the user has at least the required role
			log.WithFields(log.Fields{
				"username":     user.Username,
				"userRole":     user.Role,
				"requiredRole": role,
			}).Info("Checking if user has correct privileges")

			switch role {
			case types.AdminRole:
				if user.Role == types.AdminRole {
					return next(c)
				}
			case types.SupervisorRole:
				if user.Role == types.AdminRole || user.Role == types.SupervisorRole {
					return next(c)
				}
			case types.UserRole:
				return next(c)
			}

			// Refuse connection otherwise
			return c.String(http.StatusForbidden, fmt.Sprintf(NotAuthorized, user.Username))
		}
	}
}

// isValidID is a middleware checking that the id param is a valid BSON ID that can be handled by MongoDB
func isValidID(id string) func(next echo.HandlerFunc) echo.HandlerFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {

			idHex := c.Param(id)

			if !bson.IsObjectIdHex(idHex) {
				return c.String(http.StatusBadRequest, fmt.Sprintf(NotValidID, idHex))
			}

			return next(c)
		}
	}
}
