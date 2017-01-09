package users

import (
	"errors"
	"fmt"
	"time"

	log "github.com/Sirupsen/logrus"
	api "github.com/soprasteria/docktor/model"
	"github.com/soprasteria/docktor/model/types"
	"gopkg.in/mgo.v2/bson"
)

// Rest contains APIs entrypoints needed for accessing users
type Rest struct {
	Docktor *api.Docktor
}

// UserRest contains data of user, amputed from sensible data
type UserRest struct {
	ID          string          `json:"id"`
	Username    string          `json:"username"`
	FirstName   string          `json:"firstName"`
	LastName    string          `json:"lastName"`
	DisplayName string          `json:"displayName"`
	Role        types.Role      `json:"role"`
	Email       string          `json:"email"`
	Provider    types.Provider  `json:"provider"`
	Tags        []bson.ObjectId `json:"tags"`
}

// IsAdmin checks that the user is an admin, meaning he can do anything on the application.
func (u UserRest) IsAdmin() bool {
	return u.Role == types.AdminRole
}

//IsSupervisor checks that the user is a supervisor, meaning he sees anything that sees an admin, but as read-only
func (u UserRest) IsSupervisor() bool {
	return u.Role == types.SupervisorRole
}

// IsNormalUser checks that the user is a classic one
func (u UserRest) IsNormalUser() bool {
	return u.Role == types.UserRole
}

// HasValidRole checks the user has a known role
func (u UserRest) HasValidRole() bool {
	if u.Role != types.AdminRole && u.Role != types.SupervisorRole && u.Role != types.UserRole {
		return false
	}

	return true
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
		Tags:        user.Tags,
	}
}

// OverwriteUserFromRest get data from userWithNewData and put it in userToOverwrite
// userToOverwrite can have existing data
// ID and Provider are not updated because it's a read-only attributes.
func OverwriteUserFromRest(userToOverwrite types.User, userWithNewData UserRest) types.User {
	userToOverwrite.Username = userWithNewData.Username
	userToOverwrite.FirstName = userWithNewData.FirstName
	userToOverwrite.LastName = userWithNewData.LastName
	userToOverwrite.DisplayName = userWithNewData.DisplayName
	userToOverwrite.Email = userWithNewData.Email
	userToOverwrite.Role = userWithNewData.Role
	userToOverwrite.Tags = userWithNewData.Tags
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

// UpdateUser allows a user to modify his own profile
// This method updates: FirstName, LastName, DisplayName, Email (only in local provider mode), Tags, Role
// The controls for rights to modify a field must be done before calling this method
func (s *Rest) UpdateUser(userID string, email, displayName, firstName, lastName *string, role *types.Role, tags []bson.ObjectId) (UserRest, error) {
	if s.Docktor == nil {
		return UserRest{}, errors.New("Docktor API is not initialized")
	}

	log.WithField("userID", userID).Info("Updating user")

	// Search for user
	userFromDocktor, err := s.Docktor.Users().FindByID(userID)
	if err != nil {
		return UserRest{}, err
	}

	if userFromDocktor.ID.Hex() == "" {
		return UserRest{}, errors.New("User does not exists")
	}

	if userFromDocktor.Provider == types.LocalProvider {
		// Can update personal data only if it's a local user
		// as LDAP providers are masters of this type of data
		if email != nil {
			userFromDocktor.Email = *email
		}
		if displayName != nil {
			userFromDocktor.DisplayName = *displayName
		}
		if firstName != nil {
			userFromDocktor.FirstName = *firstName
		}
		if lastName != nil {
			userFromDocktor.LastName = *lastName
		}
	}

	if tags != nil {
		userFromDocktor.Tags = tags
	}

	if role != nil && role.IsValid() {
		userFromDocktor.Role = *role
	}

	userFromDocktor.Updated = time.Now()

	// TODO: update groups and favorites

	// Save the user
	res, err := s.Docktor.Users().Save(userFromDocktor)
	if err != nil {
		return UserRest{}, err
	}

	return GetUserRest(res), nil
}
