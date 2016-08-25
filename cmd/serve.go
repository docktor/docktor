package cmd

import (
	"github.com/soprasteria/docktor/server"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

// VERSION of Docktor
const VERSION = "0.1"

// serveCmd represents the serve command
var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "Launch Docktor server",
	Long:  `Docktor server will listen on 0.0.0.0:8080`,
	Run: func(cmd *cobra.Command, args []string) {
		server.New(VERSION)
	},
}

func init() {

	// Get configuration from command line flags
	serveCmd.Flags().StringP("mongo-url", "m", "localhost:27017", "URL to access MongoDB")
	serveCmd.Flags().StringP("jwt-secret", "j", "dev-docktor-secret", "Secret key used for JWT token authentication. Change it in your instance")
	serveCmd.Flags().StringP("env", "e", "prod", "dev or prod")
	serveCmd.Flags().String("ldap-address", "", "LDAP full address like : ldap.server:389. Optional")
	serveCmd.Flags().String("ldap-baseDN", "", "BaseDN. Optional")
	serveCmd.Flags().String("ldap-domain", "", "Domain of the user. Optional")
	serveCmd.Flags().String("ldap-bindDN", "", "DN of system account. Optional")
	serveCmd.Flags().String("ldap-bindPassword", "", "Password of system account. Optional")
	serveCmd.Flags().String("ldap-searchFilter", "", "LDAP request to find users. Optional")
	serveCmd.Flags().String("ldap-attr-username", "cn", "LDAP attribute for username of users.")
	serveCmd.Flags().String("ldap-attr-firstname", "givenName", "LDAP attribute for firstname of users.")
	serveCmd.Flags().String("ldap-attr-lastname", "sn", "LDAP attribute for lastname of users.")
	serveCmd.Flags().String("ldap-attr-realname", "cn", "LDAP attribute for real name of users.")
	serveCmd.Flags().String("ldap-attr-email", "mail", "LDAP attribute for email of users.")

	// Bind env variables.
	viper.BindPFlag("server.mongo", serveCmd.Flags().Lookup("mongo-url"))
	viper.BindPFlag("auth.jwt-secret", serveCmd.Flags().Lookup("jwt-secret"))
	viper.BindPFlag("ldap.address", serveCmd.Flags().Lookup("ldap-address"))
	viper.BindPFlag("ldap.baseDN", serveCmd.Flags().Lookup("ldap-baseDN"))
	viper.BindPFlag("ldap.domain", serveCmd.Flags().Lookup("ldap-domain"))
	viper.BindPFlag("ldap.bindDN", serveCmd.Flags().Lookup("ldap-bindDN"))
	viper.BindPFlag("ldap.bindPassword", serveCmd.Flags().Lookup("ldap-bindPassword"))
	viper.BindPFlag("ldap.searchFilter", serveCmd.Flags().Lookup("ldap-searchFilter"))
	viper.BindPFlag("ldap.attr.username", serveCmd.Flags().Lookup("ldap-attr-username"))
	viper.BindPFlag("ldap.attr.firstname", serveCmd.Flags().Lookup("ldap-attr-firstname"))
	viper.BindPFlag("ldap.attr.lastname", serveCmd.Flags().Lookup("ldap-attr-lastname"))
	viper.BindPFlag("ldap.attr.realName", serveCmd.Flags().Lookup("ldap-attr-realname"))
	viper.BindPFlag("ldap.attr.email", serveCmd.Flags().Lookup("ldap-attr-email"))
	viper.BindPFlag("env", serveCmd.Flags().Lookup("env"))
	RootCmd.AddCommand(serveCmd)

}
