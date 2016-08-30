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
	ID          string         `json:"id"`
	Username    string         `json:"username"`
	FirstName   string         `json:"firstName"`
	LastName    string         `json:"lastName"`
	DisplayName string         `json:"displayName"`
	Role        types.Role     `json:"role"`
	Email       string         `json:"email"`
	Provider    types.Provider `json:"provider"`
}

// GetUserRest returns a Docktor user, amputed of sensible data
func GetUserRest(user types.User) UserRest {
	return UserRest{
		ID:          user.ID.Hex(),
		Username:    user.Username,
		FirstName:   user.FirstName,
		LastName:    user.LastName,
		DisplayName: user.DisplayName,
		Email:       user.Email,
		Role:        user.Role,
		Provider:    user.Provider,
	}
}

// OverwriteUserFromRest get data from userWithNewData and put it in userToOverwrite
// userToOverwrite can have existing data
// ID is not updated because it's a read-only attribute. If it's a user creation, the
func OverwriteUserFromRest(userToOverwrite types.User, userWithNewData UserRest) types.User {
	userToOverwrite.Username = userWithNewData.Username
	userToOverwrite.FirstName = userWithNewData.FirstName
	userToOverwrite.LastName = userWithNewData.LastName
	userToOverwrite.DisplayName = userWithNewData.DisplayName
	userToOverwrite.Email = userWithNewData.Email
	userToOverwrite.Provider = userWithNewData.Provider
	userToOverwrite.Role = userWithNewData.Role
	return userToOverwrite
}

// GetUsersRest returns a slice of Docktor users, amputed of sensible data
func GetUsersRest(users []types.User) []UserRest {
	var usersRest []UserRest
	for _, v := range users {
		usersRest = append(usersRest, GetUserRest(v))
	}
	return usersRest
}

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

// GetAllUserRest get all users from Docktor
func (s *Rest) GetAllUserRest() ([]UserRest, error) {
	if s.Docktor == nil {
		return []UserRest{}, errors.New("Docktor API is not initialized")
	}

	users, err := s.Docktor.Users().FindAll()
	if err != nil {
		return []UserRest{}, errors.New("Can't retrieve all users")
	}
	return GetUsersRest(users), nil
}

// SaveUser saves rest user saves the user in database
// If needed, will get the user first from database and update the one
func (s *Rest) SaveUser(user UserRest) (UserRest, error) {
	if s.Docktor == nil {
		return UserRest{}, errors.New("Docktor API is not initialized")
	}

	var userToSave types.User

	// Prefill user to save with the one from database if present
	if user.ID != "" && user.ID != "-1" {
		// supposelly existing user
		userFromDocktor, err := s.Docktor.Users().FindByID(user.ID)
		if err == nil && userFromDocktor.ID.Hex() != "" {
			userToSave = userFromDocktor
		}
	}

	// Overwrite Docktor user with rest user data
	userToSave = OverwriteUserFromRest(userToSave, user)

	// Save the user
	res, err := s.Docktor.Users().Save(userToSave)
	if err != nil {
		return UserRest{}, err
	}

	return GetUserRest(res), nil
}
