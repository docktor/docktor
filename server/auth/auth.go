package auth

import (
	"errors"
	"fmt"
	"time"

	log "github.com/Sirupsen/logrus"
	"github.com/dgrijalva/jwt-go"
	api "github.com/soprasteria/docktor/model"
	"github.com/soprasteria/docktor/model/types"
	"github.com/spf13/viper"
	"golang.org/x/crypto/bcrypt"
	mgo "gopkg.in/mgo.v2"
)

const (
	authenticationTokenValidity = time.Hour * 24 * 7
	resetPasswordTokenValidity  = time.Hour * 1
)

var (
	// ErrInvalidCredentials is an error message when credentials are invalid
	ErrInvalidCredentials = errors.New("Invalid Username or Password")
	// ErrUsernameAlreadyTaken is an error message when the username is already used by someone else
	ErrUsernameAlreadyTaken = errors.New("Username already taken")
	// ErrUsernameAlreadyTakenOnLDAP is an error message when the username is already used by someone else on LDAP
	ErrUsernameAlreadyTakenOnLDAP = errors.New("Username already taken in the configured LDAP server. Try login instead")
	// ErrInvalidOldPassword is an error message when the user tries to change his password but the old password does not match the right one
	ErrInvalidOldPassword = errors.New("Old password is wrong")
	// ErrTokenInvalid is an error message when a identication token is invalid
	ErrTokenInvalid = errors.New("Token is invalid or too old. Try resetting your password again")
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

// MyCustomClaims contains data that will be signed in the JWT token
type MyCustomClaims struct {
	Username string `json:"username"`
	jwt.StandardClaims
}

// ChangePassword changes the password of the user
func (a *Authentication) ChangePassword(id, oldPassword, newPassword string) error {
	if a.Docktor == nil {
		return errors.New("Docktor API is not initialized")
	}

	user, err := a.Docktor.Users().FindByID(id)
	if err != nil {
		return errors.New("Can't find the user")
	}

	if user.Provider != types.LocalProvider {
		return errors.New("Only local users can modify their passwords")
	}

	// Checks that the old password given matches with the stored password
	err = bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(passwordWithPepper(oldPassword)),
	)
	if err != nil {
		return ErrInvalidOldPassword
	}

	hashedPassword, err := protect(newPassword)
	if err != nil {
		log.WithError(err).Error("Password hashing failed")
		return fmt.Errorf("Password can't be stored")
	}

	user.Password = hashedPassword

	_, err = a.Docktor.Users().Save(user)

	return err
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
		user, errLDAP := a.LDAP.Search(query.Username)
		if errLDAP == nil && user.Username == query.Username {
			return ErrUsernameAlreadyTakenOnLDAP
		}
	}

	hashedPassword, err := protect(query.Password)
	if err != nil {
		log.WithError(err).Error("Password hashing failed")
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

	go SendWelcomeEmail(docktorUser)

	return err
}

// CreateLoginToken generates a signed JWT Token from user to get the token when logged in.
func (a *Authentication) CreateLoginToken(username string) (string, error) {
	oneWeek := time.Now().Add(authenticationTokenValidity)
	authSecret := viper.GetString("auth.jwt-secret")
	return createToken(username, authSecret, oneWeek)
}

// CreateResetPasswordToken generates a signed JWT Token from user to get the token when forgetting password
func (a *Authentication) CreateResetPasswordToken(username string) (string, error) {
	oneHour := time.Now().Add(resetPasswordTokenValidity)
	resetPasswordSecret := viper.GetString("auth.reset-pwd-secret")
	return createToken(username, resetPasswordSecret, oneHour)
}

// createToken generates a JWT token from a username, a secret key and an expiration date to securise it
func createToken(username, secret string, expiresAt time.Time) (string, error) {
	claims := MyCustomClaims{
		username,
		jwt.StandardClaims{
			ExpiresAt: expiresAt.Unix(),
			Issuer:    "docktor",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(secret))

	if err != nil {
		return "", err
	}

	return signedToken, nil
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

// ResetPasswordUser resets the password of the user
// At the end of this method, user won't be able to authenticate again until a new password is set
func (a *Authentication) ResetPasswordUser(username string) (types.User, error) {
	user, err := a.Docktor.Users().Find(username)
	if err != nil {
		if err == mgo.ErrNotFound || user.ID.Hex() == "" {
			return types.User{}, fmt.Errorf("User %q does not exist", username)
		}
		return types.User{}, err
	}

	if user.Provider != types.LocalProvider {
		return types.User{}, fmt.Errorf("User %q has to be a local user and not a remote one (like LDAP)", username)
	}

	// TODO : check if JWT can be invalidated.

	// Reset the password in DB, helping user to change password when hacker found it.
	// Don't check if it fails because password change will be possible even if password is reset in DB.
	user.Password = ""
	user.Updated = time.Now()
	_, _ = a.Docktor.Users().Save(user)

	return user, nil
}

func (a *Authentication) setPassword(username, password string) (types.User, error) {
	user, err := a.Docktor.Users().Find(username)
	if err != nil {
		if err == mgo.ErrNotFound || user.ID.Hex() == "" {
			return types.User{}, fmt.Errorf("User %q does not exist", username)
		}
		return types.User{}, err
	}

	if user.Provider != types.LocalProvider {
		return types.User{}, fmt.Errorf("User %q has to be a local user and not a remote one (like LDAP)", username)
	}

	protectedPassword, err := protect(password)
	if err != nil {
		return types.User{}, errors.New("New password can't be stored")
	}
	user.Password = protectedPassword
	user.Updated = time.Now()
	_, err = a.Docktor.Users().Save(user)
	if err != nil {
		return types.User{}, err
	}

	return user, nil
}

// ChangeResetPasswordUser securely changes the password of a user
func (a *Authentication) ChangeResetPasswordUser(token, newPassword string) (types.User, error) {

	parsedToken, err := jwt.ParseWithClaims(token, &MyCustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Don't forget to validate the alg is what you expect:
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(viper.GetString("auth.reset-pwd-secret")), nil
	})
	if err != nil {
		return types.User{}, ErrTokenInvalid
	}

	claims, ok := parsedToken.Claims.(*MyCustomClaims)
	if !ok || !parsedToken.Valid {
		return types.User{}, ErrTokenInvalid
	}

	return a.setPassword(claims.Username, newPassword)
}

// AuthenticateUser authenticates a user
func (a *Authentication) AuthenticateUser(query *LoginUserQuery) error {

	user, err := a.Docktor.Users().Find(query.Username)
	if err != nil || user.ID.Hex() == "" {
		log.WithError(err).WithField("user", query.Username).Error("Cannot authenticate user, username not found in DB")
		return a.authenticateWhenUserNotFound(query)
	}
	log.WithField("user", query.Username).Debug("User found in DB")
	return a.authenticateWhenUserFound(user, query)

}

func (a *Authentication) authenticateWhenUserFound(docktorUser types.User, query *LoginUserQuery) error {
	log.WithFields(log.Fields{
		"provider": docktorUser.Provider,
		"user":     query.Username,
	})
	if docktorUser.Provider == "LDAP" {
		// User is from LDAP
		if a.LDAP != nil {
			ldapUser, err := a.LDAP.Login(query)
			if err != nil {
				log.WithError(err).WithField("user", docktorUser.Username).Error("LDAP authentication failed")
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
				log.WithError(err).WithField("user", docktorUser).Error("Failed to save LDAP user in DB")
				return err
			}

			return nil
		}
	} else {
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
		return err
	}

	// When user is not found, there is no way to authenticate in application
	return ErrInvalidCredentials
}
