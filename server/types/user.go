package types

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

// Role identifies global rights of connected user
type Role string

const (
	// AdminRole is an administrator role who can do anything
	AdminRole Role = "admin"
	// UserRole Classical user role
	UserRole Role = "user"
)

// IsValid checks if a role is valid
func (r Role) IsValid() bool {
	return r == AdminRole || r == UserRole
}

// Provider determines origin of user (local user, LDAP user or any other protocol)
type Provider string

const (
	// LDAPProvider is the provider for LDAP directory (Active directory and so on)
	LDAPProvider Provider = "LDAP"
	// LocalProvider is the provider when account is created within the application, not from third party
	LocalProvider Provider = "local"
)

// User model
type User struct {
	ID          bson.ObjectId   `bson:"_id,omitempty" json:"id,omitempty"`
	FirstName   string          `bson:"firstName" json:"firstName"`
	LastName    string          `bson:"lastName" json:"lastName"`
	DisplayName string          `bson:"displayName" json:"displayName"`
	Username    string          `bson:"username" json:"username"`
	Email       string          `bson:"email" json:"email"`
	Password    string          `bson:"password" json:"password"`
	Provider    Provider        `bson:"provider" json:"provider"`
	Role        Role            `bson:"role" json:"role"`
	Created     time.Time       `bson:"created" json:"created"`
	Updated     time.Time       `bson:"updated" json:"updated"`
	Favorites   []bson.ObjectId `bson:"favorites" json:"favorites"`
	Tags        []bson.ObjectId `bson:"tags" json:"tags"`
}
