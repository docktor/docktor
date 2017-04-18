package docktor

import (
	"github.com/soprasteria/docktor/model/daemons"
	"github.com/soprasteria/docktor/model/groups"
	"github.com/soprasteria/docktor/model/services"
	"github.com/soprasteria/docktor/model/sites"
	"github.com/soprasteria/docktor/model/tags"
	"github.com/soprasteria/docktor/model/users"
	"gopkg.in/mgo.v2"
)

// Docktor is the implementation structure to use the API
// It contains API accessing to services, jobs, daemons, etc. + the open session
type Docktor struct {
	services services.RepoServices
	session  Session
	groups   groups.RepoGroups
	daemons  daemons.RepoDaemons
	users    users.RepoUsers
	sites    sites.RepoSites
	tags     tags.RepoTags
}

type appContext struct {
	db *mgo.Database
}
