package groups

import (
	"github.com/soprasteria/docktor/model/types"
	"gopkg.in/mgo.v2/bson"
)

// RepoGroups is the repo for groups
type RepoGroups interface {
	// Groups

	// Drop drops the content of the collection
	Drop() error
	// Save a group into database
	Save(group types.Group) (types.Group, error)
	// Delete a group in database
	Delete(id bson.ObjectId) (bson.ObjectId, error)
	// FindByID get the group by its id
	FindByID(id string) (types.Group, error)
	// FindByIDBson get the group by its id
	FindByIDBson(id bson.ObjectId) (types.Group, error)
	// Find get the first group with a given name
	Find(name string) (types.Group, error)
	// FindAll get all groups
	FindAll() ([]types.Group, error)
	// FindAllByName get all groups by the give name
	FindAllByName(name string) ([]types.Group, error)
	// FindAllByRegex get all groups by the regex name
	FindAllByRegex(nameRegex string) ([]types.Group, error)
	// FindAllWithContainers get all groups that contains a list of containers
	FindAllWithContainers(groupNameRegex string, containersID []string) ([]types.Group, error)

	// Containers

	// FindContainer finds the first container with given containerID
	FindContainer(groupID bson.ObjectId, containerID string) (types.ContainerWithGroupID, error)
	// FindContainersOnDaemon get all containers declared as run/created on daemon
	FindContainersOnDaemon(daemon types.Daemon, containersID []string) ([]types.ContainerWithGroup, error)
	// FilterByContainer get all groups matching a regex and a list of containers
	FilterByContainer(groupNameRegex string, service string, containersID []string, imageRegex string) ([]types.ContainerWithGroup, error)
	// FilterByContainerAndService returns the data for containers matching a specified group and service
	FilterByContainerAndService(groupNameRegex string, serviceNameRegex string, containersID []string) ([]types.ContainerWithGroup, error)
	// SaveContainer saves a container to the given group
	SaveContainer(types.Group, types.Container) error
	// DeleteContainerByID deletes the container by its docker container ID. The group in which it is, is required
	DeleteContainerByID(groupID bson.ObjectId, containerID string) error
}
