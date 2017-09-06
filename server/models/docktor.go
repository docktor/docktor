package models

import (
	log "github.com/sirupsen/logrus"
	"gopkg.in/mgo.v2"

	"strings"
	"time"

	"github.com/spf13/viper"
)

const mongoTimeout = 10 * time.Second

// Session stores mongo session
var session *mgo.Session

// Session is the interface for a docktor session
type Session interface {
	SetMode(consistency mgo.Mode, refresh bool)
	Close()
}

//Client is the entrypoint of Docktor API
type Client interface {
	Collections() []IsCollection
	Services() ServicesRepo
	Groups() GroupsRepo
	Daemons() DaemonsRepo
	Users() UsersRepo
	Sites() SitesRepo
	Tags() TagsRepo
	Close()
}

type IsCollection interface {
	GetCollectionName() string
}

type IsCollectionWithIndexes interface {
	IsCollection
	CreateIndexes() error
}

// Docktor is the implementation structure to use the API
// It contains API accessing to services, jobs, daemons, etc. + the open session
type Docktor struct {
	session  Session
	services ServicesRepo
	groups   GroupsRepo
	daemons  DaemonsRepo
	users    UsersRepo
	sites    SitesRepo
	tags     TagsRepo
}

type appContext struct {
	db *mgo.Database
}

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
func Get() (Client, error) {
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

	return &Docktor{
		services: NewServicesRepo(context.db.C("services")),
		groups:   NewGroupsRepo(context.db.C("groups")),
		daemons:  NewDaemonsRepo(context.db.C("daemons")),
		users:    NewUsersRepo(context.db.C("users")),
		sites:    NewSitesRepo(context.db.C("sites")),
		tags:     NewTagsRepo(context.db.C("tags")),
		session:  s,
	}, nil
}

// Close the connexion to docktor API
func (dock *Docktor) Close() {
	dock.session.Close()
}

// Services is the entrypoint for Services API
func (dock *Docktor) Services() ServicesRepo {
	return dock.services
}

// Groups is the entrypoint for Groups API
func (dock *Docktor) Groups() GroupsRepo {
	return dock.groups
}

// Daemons is the entrypoint for Daemons API
func (dock *Docktor) Daemons() DaemonsRepo {
	return dock.daemons
}

// Users is the entrypoint for Users API
func (dock *Docktor) Users() UsersRepo {
	return dock.users
}

// Sites is the entrypoint for Sites API
func (dock *Docktor) Sites() SitesRepo {
	return dock.sites
}

// Tags is the entrypoint for Tags API
func (dock *Docktor) Tags() TagsRepo {
	return dock.tags
}

func (dock *Docktor) Collections() []IsCollection {
	return []IsCollection{
		dock.daemons,
		dock.services,
		dock.groups,
		dock.users,
		dock.sites,
		dock.tags,
	}
}
