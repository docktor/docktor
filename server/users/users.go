package users

import (
	"errors"
	"fmt"

	api "github.com/soprasteria/godocktor-api"
	"github.com/soprasteria/godocktor-api/types"
)

// Rest contains APIs entrypoints needed for accessing users
type Rest struct {
	Docktor *api.Docktor
}

// UserRest contains data of user, amputed from sensible data
type UserRest struct {
	Username    string `json:"username"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	DisplayName string `json:"displayName"`
	Role        Role   `json:"role"`
	Email       string `json:"email"`
}

// Role identifies global rights of connected user
type Role string

const (
	// AdminRole is administrator role (can do anything)
	AdminRole Role = "admin"
	// UserRole Classical user role
	UserRole Role = "user"
)

// GetUserRest gets user from Docktor
func (s *Rest) GetUserRest(username string) (UserRest, error) {
	if s.Docktor == nil {
		return UserRest{}, errors.New("Docktor API is not initialized")
	}
	user, err := s.Docktor.Users().Find(username)
	if err != nil {
		return UserRest{}, fmt.Errorf("Can't retrieve user %s", username)
	}

	return GetUserRest(user), nil
}

// GetUserRest returns a Docktor user, amputed of sensible data
func GetUserRest(user types.User) UserRest {
	return UserRest{
		Username:    user.Username,
		FirstName:   user.FirstName,
		LastName:    user.LastName,
		DisplayName: user.DisplayName,
		Email:       user.Email,
		Role:        Role(user.Role),
	}
}
