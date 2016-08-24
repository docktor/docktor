package ldaputil

import (
	"fmt"

	"gopkg.in/ldap.v2"
)

// LDAP contains data used to connect to an LDAP directory service
type LDAP struct {
	LdapServer     string
	BaseDN         string
	Attributes     []string
	Connection     *ldap.Conn
	SystemAccount  string
	SystemPassword string
}

// Open opens the LDAP connection
func (s *LDAP) Open() error {
	var err error
	s.Connection, err = ldap.Dial("tcp", s.LdapServer)
	if err != nil {
		return err
	}
	return nil
}

// Close closes the LDAP connection
func (s *LDAP) Close() {
	s.Connection.Close()
	s.Connection = nil
}

// Find search the user in the LDAP directory service
func (s *LDAP) Find(domain, user string) (*ldap.SearchResult, error) {
	var err error
	if s.Connection == nil {
		err = s.Open()
		if err != nil {
			return nil, err
		}
	}

	err = s.Connection.Bind(domain+"\\"+s.SystemAccount, s.SystemPassword)
	if err != nil {
		return nil, err
	}
	search := ldap.NewSearchRequest(
		s.BaseDN,
		ldap.ScopeWholeSubtree, ldap.NeverDerefAliases, 0, 0, false,
		fmt.Sprintf("(sAMAccountName=%s)", user),
		s.Attributes,
		nil)

	sr, err := s.Connection.Search(search)
	if err != nil {
		return nil, err
	}

	sr.PrettyPrint(0)

	return sr, nil
}

// Bind performs a bind to the LDAP with given domain, user and password
func (s *LDAP) Bind(domain, user, passwd string) error {
	l, err := ldap.Dial("tcp", s.LdapServer)
	if err != nil {
		return err
	}

	defer l.Close()

	err = l.Bind(domain+"\\"+user, passwd)
	if err != nil {
		return err
	}

	return nil
}

// Search is used for LDAP authentication
func (s *LDAP) Search(domain, user, passwd string) (*ldap.SearchResult, error) {
	l, err := ldap.Dial("tcp", s.LdapServer)
	if err != nil {
		return nil, err
	}

	defer l.Close()

	err = l.Bind(domain+"\\"+user, passwd)
	if err != nil {
		return nil, err
	}

	search := ldap.NewSearchRequest(
		s.BaseDN,
		ldap.ScopeWholeSubtree, ldap.NeverDerefAliases, 0, 0, false,
		fmt.Sprintf("(sAMAccountName=%s)", user),
		s.Attributes,
		nil)

	sr, err := l.Search(search)
	if err != nil {
		Warning.Printf(err.Error())
		return nil, err
	}

	return sr, nil
}
