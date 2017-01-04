package types

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

const (
	// MemberModeratorRole is the role for user able to administrate their group
	MemberModeratorRole MemberRole = "moderator"
	// MemberUserRole is the default role for a simple user in a group
	MemberUserRole MemberRole = "member"
)

// MemberRole defines the types of role available for a user as a member of a group
type MemberRole string

// Member is user whois subscribed to the groupe. His role in this group defines what he is able to do.
type Member struct {
	User bson.ObjectId `bson:"user" json:"user"`
	Role MemberRole    `bson:"role" json:"role"`
}

// Members is a slice of multiple Member entities
type Members []Member

// FileSystem is a filesystem watched by the group
type FileSystem struct {
	ID          bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Daemon      bson.ObjectId `bson:"daemon" json:"daemon"`
	Partition   string        `bson:"partition,omitempty" json:"partition,omitempty"`
	Description string        `bson:"description" json:"description"`
}

//FileSystems is a slice of FileSystem
type FileSystems []FileSystem

// Group is a entity (like a project) that gather services instances as containers
type Group struct {
	ID           bson.ObjectId   `bson:"_id,omitempty" json:"id,omitempty"`
	Created      time.Time       `bson:"created" json:"created"`
	Title        string          `bson:"title" json:"title"`
	Description  string          `bson:"description" json:"description"`
	PortMinRange int             `bson:"portminrange" json:"portminrange"`
	PortMaxRange int             `bson:"portmaxrange" json:"portmaxrange"`
	FileSystems  FileSystems     `bson:"filesystems" json:"filesystems"`
	Containers   Containers      `bson:"containers" json:"containers"`
	Members      Members         `bson:"members" json:"members"`
	Tags         []bson.ObjectId `bson:"tags" json:"tags"`
}

// AddFileSystem adds a FileSystem to the Group
func (g *Group) AddFileSystem(f FileSystem) {
	g.FileSystems = append(g.FileSystems, f)
}

// AddContainer adds a Container to the Group
func (g *Group) AddContainer(c Container) {
	g.Containers = append(g.Containers, c)
}

// ContainerWithGroup is a entity which contains a container, linked to a group
type ContainerWithGroup struct {
	Group     Group
	Container Container
}

// ContainerWithGroupID is an entity which contains a container, linked to a group ID
type ContainerWithGroupID struct {
	Container Container     `bson:"container" json:"container"`
	ID        bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
}
