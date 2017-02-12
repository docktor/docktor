package docktor

import (
	log "github.com/Sirupsen/logrus"
	"gopkg.in/mgo.v2"

	"strings"
	"time"

	"github.com/soprasteria/docktor/model/daemons"
	"github.com/soprasteria/docktor/model/groups"
	"github.com/soprasteria/docktor/model/services"
	"github.com/soprasteria/docktor/model/sites"
	"github.com/soprasteria/docktor/model/tags"
	"github.com/soprasteria/docktor/model/users"
	"github.com/spf13/viper"
)

const mongoTimeout = 10 * time.Second

// Session stores mongo session
var session *mgo.Session

// Connect connects to mongodb
func Connect() {
	uri := viper.GetString("server.mongo.addr")
	log.WithField("uris", uri).WithField("timeout", mongoTimeout).Info("Connecting to Mongo cluster...")
	s, err := mgo.DialWithInfo(&mgo.DialInfo{
		Addrs:   strings.Split(uri, ","),
		Timeout: mongoTimeout,
	})

	if err != nil {
		log.WithError(err).Fatal("Can't connect to mongo")
	}

	s.SetSafe(&mgo.Safe{})
	log.WithField("uris", uri).Info("Connecting to Mongo cluster [OK]")
	session = s
}

// Get the connexion to docktor API
func Get() (*Docktor, error) {
	username := viper.GetString("server.mongo.username")
	password := viper.GetString("server.mongo.password")
	s := session.Clone()
	s.SetSafe(&mgo.Safe{})
	database := s.DB("docktor")
	if username != "" && password != "" {
		err := database.Login(username, password)
		if err != nil {
			return nil, err
		}
	}
	context := appContext{database}
	services := &services.Repo{Coll: context.db.C("services")}
	groups := &groups.Repo{Coll: context.db.C("groups")}
	daemons := &daemons.Repo{Coll: context.db.C("daemons")}
	users := &users.Repo{Coll: context.db.C("users")}
	sites := &sites.Repo{Coll: context.db.C("sites")}
	tags := &tags.Repo{Coll: context.db.C("tags")}

	return &Docktor{
		services: services,
		groups:   groups,
		daemons:  daemons,
		users:    users,
		sites:    sites,
		tags:     tags,
		session:  s,
	}, nil
}

// Close the connexion to docktor API
func (dock *Docktor) Close() {
	dock.session.Close()
}

// Services is the entrypoint for Services API
func (dock *Docktor) Services() services.RepoServices {
	return dock.services
}

// Groups is the entrypoint for Groups API
func (dock *Docktor) Groups() groups.RepoGroups {
	return dock.groups
}

// Daemons is the entrypoint for Daemons API
func (dock *Docktor) Daemons() daemons.RepoDaemons {
	return dock.daemons
}

// Users is the entrypoint for Users API
func (dock *Docktor) Users() users.RepoUsers {
	return dock.users
}

// Sites is the entrypoint for Sites API
func (dock *Docktor) Sites() sites.RepoSites {
	return dock.sites
}

// Tags is the entrypoint for Tags API
func (dock *Docktor) Tags() tags.RepoTags {
	return dock.tags
}
