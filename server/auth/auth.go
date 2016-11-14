package auth

import (
	"errors"
	"fmt"
	"net/mail"
	"time"

	"golang.org/x/crypto/bcrypt"

	"github.com/soprasteria/docktor/server/email"
	api "github.com/soprasteria/godocktor-api"
	"github.com/soprasteria/godocktor-api/types"
	"github.com/spf13/viper"
)

var (
	// ErrInvalidCredentials is an error message when credentials are invalid
	ErrInvalidCredentials = errors.New("Invalid Username or Password")
	// ErrUsernameAlreadyTaken is an error message when the username is already used by someone else
	ErrUsernameAlreadyTaken = errors.New("Username already taken")
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

// RegisterUserQuery represent connection data needed to register user
type RegisterUserQuery struct {
	Username  string
	Password  string
	Firstname string
	Lastname  string
	Email     string
}

// RegisterUser registers the user in the application
// Can't register if user already exists (in Docktor or LDAP)
func (a *Authentication) RegisterUser(query *RegisterUserQuery) error {
	// First search on Docktor
	_, err := a.Docktor.Users().Find(query.Username)
	if err == nil {
		// User already exists
		return ErrUsernameAlreadyTaken
	}

	// Then search in LDAP, if configured
	if a.LDAP != nil {
		// TODO : search on LDAP to check if registerd user exists in LDAP but never login in app.
	}

	hashedPassword, err := protect(query.Password)
	if err != nil {
		fmt.Println("Cant hash password : " + err.Error())
		return fmt.Errorf("Password can't be stored")
	}

	docktorUser := types.User{
		Username:    query.Username,
		Password:    hashedPassword,
		FirstName:   query.Firstname,
		LastName:    query.Lastname,
		DisplayName: query.Firstname + " " + query.Lastname,
		Email:       query.Email,
		Created:     time.Now(),
		Updated:     time.Now(),
		Provider:    types.LocalProvider,
		Role:        types.UserRole,
	}

	_, err = a.Docktor.Users().Save(docktorUser)
	if err != nil {
		return err
	}

	go sendWelcomeEmail(docktorUser)

	return err
}

func sendWelcomeEmail(user types.User) error {

	return email.Send(email.SendOptions{
		To: []mail.Address{
			{Name: user.DisplayName, Address: user.Email},
		},
		Subject: "Welcome to Docktor",
		Body:    "Your account has been created !",
	})
}

func protect(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(passwordWithPepper(password)), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func passwordWithPepper(password string) string {
	return password + viper.GetString("auth.bcrypt-pepper")
}

// AuthenticateUser authenticates a user
func (a *Authentication) AuthenticateUser(query *LoginUserQuery) error {

	user, err := a.Docktor.Users().Find(query.Username)
	if err != nil || user.ID.Hex() == "" {
		fmt.Printf("User %s not found\n", query.Username)
		fmt.Println(err.Error())
		return a.authenticateWhenUserNotFound(query)
	}
	fmt.Println("User found")
	return a.authenticateWhenUserFound(user, query)

}

func (a *Authentication) authenticateWhenUserFound(docktorUser types.User, query *LoginUserQuery) error {
	if docktorUser.Provider == "LDAP" {
		fmt.Println("User is LDAP")
		// User is from LDAP
		if a.LDAP != nil {
			ldapUser, err := a.LDAP.Login(query)
			if err != nil {
				fmt.Println(err.Error())
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
				fmt.Println(err.Error())
				return err
			}

			return nil
		}
	} else {
		fmt.Println("User is local")
		err := bcrypt.CompareHashAndPassword(
			[]byte(docktorUser.Password),
			[]byte(passwordWithPepper(query.Password)),
		)
		if err == nil {
			return nil
		}
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
			Provider:    types.LDAPProvider,
			Role:        types.UserRole,
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
