package models

import (
	"github.com/soprasteria/docktor/server/types"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// GroupsRepo is the repo for groups
type GroupsRepo interface {
	//===========
	// Groups
	//===========

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
	// Remove a member from all groups
	RemoveMemberFromAllGroups(userID bson.ObjectId) (*mgo.ChangeInfo, error)

	//===========
	// Containers
	//===========

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

// DefaultGroupsRepo is the repository for groups
type DefaultGroupsRepo struct {
	coll *mgo.Collection
}

// NewGroupsRepo instantiate new GroupsRepo
func NewGroupsRepo(coll *mgo.Collection) GroupsRepo {
	return &DefaultGroupsRepo{coll: coll}
}

// Drop drops the content of the collection
func (r *DefaultGroupsRepo) Drop() error {
	return r.coll.DropCollection()
}

// Save a group into a database
func (r *DefaultGroupsRepo) Save(group types.Group) (types.Group, error) {
	newGroup := types.NewGroup(group)
	_, err := r.coll.UpsertId(group.ID, bson.M{"$set": types.NewGroup(group)})
	return newGroup, err
}

// Delete a group in database
func (r *DefaultGroupsRepo) Delete(id bson.ObjectId) (bson.ObjectId, error) {
	err := r.coll.RemoveId(id)
	return id, err
}

// Find get the first group with a given name
func (r *DefaultGroupsRepo) Find(name string) (types.Group, error) {
	result := types.Group{}
	err := r.coll.Find(bson.M{"title": name}).One(&result)
	return result, err
}

// FindByID get the group by its id
func (r *DefaultGroupsRepo) FindByID(id string) (types.Group, error) {
	result := types.Group{}
	err := r.coll.FindId(bson.ObjectIdHex(id)).One(&result)
	return result, err
}

// FindByIDBson get the group by its id (as a bson object)
func (r *DefaultGroupsRepo) FindByIDBson(id bson.ObjectId) (types.Group, error) {
	result := types.Group{}
	err := r.coll.FindId(id).One(&result)
	return result, err
}

// FindAll get all groups
func (r *DefaultGroupsRepo) FindAll() ([]types.Group, error) {
	results := []types.Group{}
	err := r.coll.Find(bson.M{}).All(&results)
	return results, err
}

// FindAllByName get all groups by the give name
func (r *DefaultGroupsRepo) FindAllByName(name string) ([]types.Group, error) {
	results := []types.Group{}
	err := r.coll.Find(bson.M{"title": name}).All(&results)
	return results, err
}

// FindAllByRegex get all groups by the regex name
func (r *DefaultGroupsRepo) FindAllByRegex(nameRegex string) ([]types.Group, error) {
	results := []types.Group{}
	err := r.coll.Find(bson.M{"title": &bson.RegEx{Pattern: nameRegex}}).All(&results)
	return results, err
}

// FindAllWithContainers get all groups that contains a list of containers
func (r *DefaultGroupsRepo) FindAllWithContainers(groupNameRegex string, containersID []string) ([]types.Group, error) {
	results := []types.Group{}
	err := r.coll.Find(
		bson.M{
			"title":                  &bson.RegEx{Pattern: groupNameRegex},
			"containers.containerId": &bson.M{"$in": containersID},
		}).All(&results)

	return results, err
}

// RemoveMemberFromAllGroups remove a member from a group
func (r *DefaultGroupsRepo) RemoveMemberFromAllGroups(userID bson.ObjectId) (*mgo.ChangeInfo, error) {
	return r.coll.UpdateAll(
		bson.M{},
		bson.M{"$pull": bson.M{"members": bson.M{"user": userID}}},
	)
}

// FindContainer finds the first container with given containerID
func (r *DefaultGroupsRepo) FindContainer(groupID bson.ObjectId, containerID string) (types.ContainerWithGroupID, error) {
	result := types.ContainerWithGroupID{}
	// Filter the groups
	filterGroupByTitle := bson.M{"$match": bson.M{"_id": groupID}}
	// Get containers from filtered groups
	getContainers := bson.M{"$unwind": "$containers"}
	// Filter by containers
	filterContainers := bson.M{"$match": bson.M{
		"containers.containerId": &bson.M{"$in": []string{containerID}},
	}}
	// Get ids from containers
	getIds := bson.M{"$project": bson.M{"container": "$containers"}}

	operations := []bson.M{filterGroupByTitle, getContainers, filterContainers, getIds}
	err := r.coll.Pipe(operations).One(&result)
	return result, err
}

// FilterByContainer get all groups matching a regex and a list of containers
//	db.getCollection('groups').aggregate([
//				{"$match" : {
//						"title": {"$regex" : ".*"}
//						}
//				},
//				{ "$unwind" : "$containers" },
//				{ "$match" : {
//						"containers.containerId": {"$in": ["ID"]},
//						"containers.serviceTitle": "Redis",
//						"containers.image" : {"$regex" : "redis:2.*"}
//				}}
//				,
//				{ "$project" : {
//						"_id" : 1,
//						"container" : "$containers",
//						}
//				}
// ])
func (r *DefaultGroupsRepo) FilterByContainer(groupNameRegex string, service string, containersID []string, imageRegex string) (containersWithGroup []types.ContainerWithGroup, err error) {
	results := []types.ContainerWithGroupID{}

	// Aggregation in 3 steps to get a list of containers id from groups
	// Filter the groups
	filterGroupByTitle := bson.M{"$match": bson.M{
		"title": &bson.RegEx{Pattern: groupNameRegex},
	}}
	// Get containers from filtered groups
	getContainers := bson.M{"$unwind": "$containers"}
	// Filter by containers
	filterContainers := bson.M{"$match": bson.M{
		"containers.containerId":  &bson.M{"$in": containersID},
		"containers.serviceTitle": service,
		"containers.image":        &bson.RegEx{Pattern: imageRegex},
	}}
	// Get ids from containers
	getIds := bson.M{"$project": bson.M{"_id": 1, "container": "$containers"}}

	operations := []bson.M{filterGroupByTitle, getContainers, filterContainers, getIds}
	err = r.coll.Pipe(operations).All(&results)
	if err != nil {
		return
	}

	// Get group entity for each container
	for _, v := range results {
		group, err := r.FindByIDBson(v.ID)
		if err != nil {
			return []types.ContainerWithGroup{}, err
		}
		crg := types.ContainerWithGroup{
			Group:     group,
			Container: v.Container,
		}
		containersWithGroup = append(containersWithGroup, crg)
	}
	return
}

// FilterByContainerAndService returns the data for containers matching a specified group and service
func (r *DefaultGroupsRepo) FilterByContainerAndService(groupNameRegex string, serviceNameRegex string, containersID []string) (containersWithGroup []types.ContainerWithGroup, err error) {
	results := []types.ContainerWithGroupID{}

	// Aggregation in 3 steps to get a list of containers id from groups
	// Filter the groups
	filterGroupByTitle := bson.M{"$match": bson.M{
		"title": &bson.RegEx{Pattern: groupNameRegex},
	}}
	// Get containers from filtered groups
	getContainers := bson.M{"$unwind": "$containers"}
	// Filter by containers
	filterContainers := bson.M{"$match": bson.M{
		"containers.containerId":  &bson.M{"$in": containersID},
		"containers.serviceTitle": &bson.RegEx{Pattern: serviceNameRegex},
	}}
	// Get ids from containers
	getIds := bson.M{"$project": bson.M{"container": "$containers"}}

	operations := []bson.M{filterGroupByTitle, getContainers, filterContainers, getIds}
	err = r.coll.Pipe(operations).All(&results)
	if err != nil {
		return
	}

	// Get group entity for each container
	for _, v := range results {
		group, err := r.FindByIDBson(v.ID)
		if err != nil {
			return []types.ContainerWithGroup{}, err
		}
		crg := types.ContainerWithGroup{
			Group:     group,
			Container: v.Container,
		}
		containersWithGroup = append(containersWithGroup, crg)
	}
	return
}

// FindContainersOnDaemon get all containers that are declared to be run/created on the daemon.
// Can be filtered out with containersID. Will get only containers that are not in this slice.
// db.getCollection('groups').aggregate([
//     {"$match" :
//            {containers: {
//                $elemMatch: {daemonId : "<daemon>" }
//            }}
//     },
//     { "$unwind" : "$containers" },
//     { "$match" : {
// 	        "containers.containerId": {"$nin": ["<containerID1>","<containerID2>"]},
//          "containers.daemonId": "<daemon>"
//     }},
//     { "$project" : {"container" : "$containers"}}
//    ]);
func (r *DefaultGroupsRepo) FindContainersOnDaemon(daemon types.Daemon, containersID []string) (containersWithGroup []types.ContainerWithGroup, err error) {
	results := []types.ContainerWithGroupID{}

	// Aggregation in 4 steps to get a list of containers
	// Filter the groups
	filterByDaemon := bson.M{"$match": bson.M{
		"containers": &bson.M{"$elemMatch": &bson.M{"daemonId": daemon.ID.Hex()}},
	}}
	// Get containers from filtered groups
	getContainers := bson.M{"$unwind": "$containers"}
	// Containers filtered by daemon and docker containers
	filterContainers := bson.M{"$match": bson.M{
		"containers.containerId": &bson.M{"$nin": containersID},
		"containers.daemonId":    daemon.ID,
	}}
	// Get ids from containers
	getIds := bson.M{"$project": bson.M{"container": "$containers"}}

	operations := []bson.M{filterByDaemon, getContainers, filterContainers, getIds}
	err = r.coll.Pipe(operations).All(&results)
	if err != nil {
		return
	}

	// Get group entity for each container
	for _, v := range results {
		group, err := r.FindByIDBson(v.ID)
		if err != nil {
			return []types.ContainerWithGroup{}, err
		}
		crg := types.ContainerWithGroup{
			Group:     group,
			Container: v.Container,
		}
		containersWithGroup = append(containersWithGroup, crg)
	}
	return
}

// update({
//        _id: ObjectId("id"),
//        "containers._id": ObjectId("id")
//    },{
//        $set: {"containers.$": {<container object>}}
//    }
// );
func (r *DefaultGroupsRepo) updateContainer(group types.Group, container types.Container) error {
	err := r.coll.Update(
		bson.M{"_id": group.ID, "containers._id": container.ID},
		bson.M{"$set": bson.M{"containers.$": container}},
	)
	return err
}

// SaveContainer saves a container to the given group
func (r *DefaultGroupsRepo) SaveContainer(group types.Group, container types.Container) error {
	var results []interface{}
	// Check if there's already a container with this _id
	operations := []bson.M{
		{"$match": bson.M{"_id": group.ID}},
		{"$unwind": "$containers"},
		{"$match": bson.M{"containers._id": container.ID}},
		{"$group": bson.M{"_id": "null", "count": bson.M{"$sum": 1}}},
	}
	err := r.coll.Pipe(operations).All(&results)
	if err != nil {
		return err
	}
	if len(results) > 0 {
		return r.updateContainer(group, container)
	}

	err = r.coll.Update(
		bson.M{"_id": group.ID},
		bson.M{"$push": bson.M{"containers": container}},
	)
	return err
}

// DeleteContainerByID deletes the container by its docker container ID. The group in which it is, is required
func (r *DefaultGroupsRepo) DeleteContainerByID(groupID bson.ObjectId, containerID string) error {
	return r.coll.Update(
		bson.M{"_id": groupID},
		bson.M{"$pull": bson.M{"containerId": containerID}},
	)
}
