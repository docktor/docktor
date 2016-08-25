package auth

import (
	"errors"
	"fmt"
	"time"

	api "github.com/soprasteria/godocktor-api"
	"github.com/soprasteria/godocktor-api/types"
)

var (
	// ErrInvalidCredentials is an error message when credentials are invalid
	ErrInvalidCredentials = errors.New("Invalid Username or Password")
)

// Authentication contains all APIs entrypoints needed for authentication
type Authentication struct {
	Docktor *api.Docktor
	LDAP    *LDAP
}

// LoginUserQuery represents connection data
type LoginUserQuery struct {
	Username string
	Password string
}

// AuthenticateUser authenticates a user
func (a *Authentication) AuthenticateUser(query *LoginUserQuery) error {

	user, err := a.Docktor.Users().Find(query.Username)
	if err != nil || user.ID.Hex() == "" {
		return a.authenticateWhenUserNotFound(query)
	}

	return a.authenticateWhenUserFound(user, query)

}

func (a *Authentication) authenticateWhenUserFound(docktorUser types.User, query *LoginUserQuery) error {
	if docktorUser.Provider == "LDAP" {
		// User is from LDAP
		if a.LDAP != nil {
			ldapUser, err := a.LDAP.Login(query)
			if err != nil {
				return ErrInvalidCredentials
			}

			docktorUser.Updated = time.Now()
			docktorUser.FirstName = ldapUser.FirstName
			docktorUser.LastName = ldapUser.LastName
			docktorUser.DisplayName = ldapUser.FirstName + " " + ldapUser.LastName
			docktorUser.Username = ldapUser.Username
			docktorUser.Email = ldapUser.Email

			_, err = a.Docktor.Users().Save(docktorUser)
			if err != nil {
				return err
			}

			return nil
		}
	} else {
		// User is local
	}

	return ErrInvalidCredentials
}

func (a *Authentication) authenticateWhenUserNotFound(query *LoginUserQuery) error {
	if a.LDAP != nil {
		// Authenticating with LDAP
		ldapUser, err := a.LDAP.Login(query)
		fmt.Printf("%+v\n", ldapUser)
		if err != nil {
			return ErrInvalidCredentials
		}

		docktorUser := types.User{
			FirstName:   ldapUser.FirstName,
			LastName:    ldapUser.LastName,
			DisplayName: ldapUser.FirstName + " " + ldapUser.LastName,
			Username:    ldapUser.Username,
			Email:       ldapUser.Email,
			Provider:    "LDAP",
			Role:        "user",
			Created:     time.Now(),
			Updated:     time.Now(),
		}
		_, err = a.Docktor.Users().Save(docktorUser)
		if err != nil {
			return err
		}

		return nil
	}

	// When user is not found, there is no way to authenticate in application
	return ErrInvalidCredentials
}
