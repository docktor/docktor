package types

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

// FileSystem is a filesystem watched by the group
type FileSystem struct {
	ID          bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Daemon      string        `bson:"daemon" json:"daemon"`
	Partition   string        `bson:"partition,omitempty" json:"partition,omitempty"`
	Description string        `bson:"description" json:"description"`
}

//FileSystems is a slice of FileSystem
type FileSystems []FileSystem

// Group is a entity (like a project) that gather services instances as containers
type Group struct {
	ID           bson.ObjectId `bson:"_id,omitempty" json:"id,omitempty"`
	Created      time.Time     `bson:"created" json:"created"`
	Title        string        `bson:"title" json:"title"`
	Description  string        `bson:"description" json:"description"`
	PortMinRange int           `bson:"portminrange" json:"portminrange"`
	PortMaxRange int           `bson:"portmaxrange" json:"portmaxrange"`
	Daemon       bson.ObjectId `bson:"daemon" json:"daemon"`
	FileSystems  FileSystems   `bson:"filesystems" json:"filesystems"`
	Containers   Containers    `bson:"containers" json:"containers"`
	User         bson.ObjectId `bson:"variables" json:"variables"`
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
