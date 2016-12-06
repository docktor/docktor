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
	// SupervisorRole is a role who can see anything as read-only but can not do more than a classical user
	SupervisorRole Role = "supervisor"
	// UserRole Classical user role
	UserRole Role = "user"
)

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
	Groups      []bson.ObjectId `bson:"groups" json:"groups"`
	Favorites   []bson.ObjectId `bson:"favorites" json:"favorites"`
}
