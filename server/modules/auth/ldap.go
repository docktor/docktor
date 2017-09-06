package auth

import (
	"errors"
	"fmt"
	"strings"

	log "github.com/sirupsen/logrus"
	"gopkg.in/ldap.v2"
)

// LDAP is an LDAP entry point allowing authentication with an LDAP server
type LDAP struct {
	server *LDAPConf
	conn   *ldap.Conn
}

// LDAPConf contains data used to connect to an LDAP directory service
type LDAPConf struct {
	LdapServer   string
	BaseDN       string
	BindDN       string
	BindPassword string
	SearchFilter string
	Attr         Attributes
}

// Attributes list all LDAP attributes names in the LDAP
type Attributes struct {
	Username  string
	Firstname string
	Lastname  string
	Realname  string
	Email     string
}

//LDAPUserInfo contains LDAP attributes values for a user
type LDAPUserInfo struct {
	DN        string
	Username  string
	FirstName string
	LastName  string
	RealName  string
	Email     string
}

//NewLDAP create a LDAP entrypoint
func NewLDAP(server *LDAPConf) *LDAP {
	return &LDAP{server: server}
}

// Search search existence of username in LDAP
// Returns the info about the user if found, error otherwize
func (a *LDAP) Search(username string) (*LDAPUserInfo, error) {
	// Reach the ldap server
	if err := a.dial(); err != nil {
		log.WithError(err).Error("LDAP dialing failed")
		return nil, err
	}
	defer a.conn.Close()

	// perform initial authentication
	if err := a.initialBind(); err != nil {
		log.WithError(err).Error("LDAP binding failed")
		return nil, err
	}

	// find user entry & attributes
	ldapUser, err := a.searchForUser(username)
	if err != nil {
		log.WithError(err).WithField("username", username).Error("Error looking for user in AD")
		return nil, err
	}

	return ldapUser, nil
}

//Login log the user in
func (a *LDAP) Login(query *LoginUserQuery) (*LDAPUserInfo, error) {
	// Reach the ldap server
	if err := a.dial(); err != nil {
		log.WithError(err).Error("LDAP dialing failed")
		return nil, err
	}
	defer a.conn.Close()

	// perform initial authentication
	if err := a.initialBind(); err != nil {
		log.WithError(err).Error("LDAP binding failed")
		return nil, err
	}

	// find user entry & attributes
	ldapUser, err := a.searchForUser(query.Username)
	if err != nil {
		log.WithError(err).WithField("username", query.Username).Error("Error looking for user in AD")
		return nil, err
	}

	// Authenticate user with password
	return ldapUser, a.secondBind(ldapUser, query.Password)

}

// Dial dials the LDAP server
func (a *LDAP) dial() (err error) {
	a.conn, err = ldap.Dial("tcp", a.server.LdapServer)
	return err
}

// initialBind creates the first connexion with readonly user
func (a *LDAP) initialBind() error {

	if a.server.BindPassword == "" || a.server.BindDN == "" {
		return fmt.Errorf("Bindpassword or bindDN (%s) is empty", a.server.BindDN)
	}

	// LDAP Bind
	if err := a.conn.Bind(a.server.BindDN, a.server.BindPassword); err != nil {
		if ldapErr, ok := err.(*ldap.Error); ok {
			if ldapErr.ResultCode == ldap.LDAPResultInvalidCredentials {
				return ErrInvalidCredentials
			}
		}
		return err
	}

	return nil
}

// secondBind authenticate the user
func (a *LDAP) secondBind(ldapUser *LDAPUserInfo, userPassword string) error {
	if err := a.conn.Bind(ldapUser.DN, userPassword); err != nil {
		log.WithError(err).WithField("ldapUser", *ldapUser).Error("Failed LDAP secondBind")
		if ldapErr, ok := err.(*ldap.Error); ok {
			if ldapErr.ResultCode == ldap.LDAPResultInvalidCredentials {
				return ErrInvalidCredentials
			}
		}
		return err
	}

	return nil
}

// searchForUser search the user in LDAP
func (a *LDAP) searchForUser(username string) (*LDAPUserInfo, error) {
	var searchResult *ldap.SearchResult
	var err error

	searchReq := ldap.SearchRequest{
		BaseDN:       a.server.BaseDN,
		Scope:        ldap.ScopeWholeSubtree,
		DerefAliases: ldap.NeverDerefAliases,
		Attributes: []string{
			a.server.Attr.Username,
			a.server.Attr.Firstname,
			a.server.Attr.Lastname,
			a.server.Attr.Realname,
			a.server.Attr.Email,
			"dn",
		},
		Filter: strings.Replace(a.server.SearchFilter, "%s", ldap.EscapeFilter(username), -1),
	}

	searchResult, err = a.conn.Search(&searchReq)
	if err != nil {
		return nil, err
	}

	if len(searchResult.Entries) == 0 {
		return nil, ErrInvalidCredentials
	}

	if len(searchResult.Entries) > 1 {
		return nil, errors.New("Ldap search matched more than one entry, please review your filter setting")
	}

	return &LDAPUserInfo{
		DN:        searchResult.Entries[0].DN,
		Username:  getLdapAttr(a.server.Attr.Username, searchResult),
		FirstName: getLdapAttr(a.server.Attr.Firstname, searchResult),
		LastName:  getLdapAttr(a.server.Attr.Lastname, searchResult),
		RealName:  getLdapAttr(a.server.Attr.Realname, searchResult),
		Email:     getLdapAttr(a.server.Attr.Email, searchResult),
	}, nil
}

func getLdapAttrN(name string, result *ldap.SearchResult, n int) string {
	for _, attr := range result.Entries[n].Attributes {
		if attr.Name == name && len(attr.Values) > 0 {
			return attr.Values[0]
		}
	}
	return ""
}

func getLdapAttr(name string, result *ldap.SearchResult) string {
	return getLdapAttrN(name, result, 0)
}
