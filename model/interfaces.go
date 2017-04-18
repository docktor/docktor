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

// Session is the interface for a docktor sessio
type Session interface {
	SetMode(consistency mgo.Mode, refresh bool)
	Close()
}

//Client is the entrypoint of Docktor API
type Client interface {
	Services() services.RepoServices
	Groups() groups.RepoGroups
	Daemons() daemons.RepoDaemons
	Users() users.RepoUsers
	Sites() sites.RepoSites
	Tags() tags.RepoTags
	Close()
}
