package cmd

import (
	docktor "github.com/soprasteria/docktor/model"
	"github.com/soprasteria/docktor/server"
	"github.com/soprasteria/docktor/server/email"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

// serveCmd represents the serve command
var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "Launch Docktor server",
	Long:  `Docktor server will listen on 0.0.0.0:8080`,
	Run: func(cmd *cobra.Command, args []string) {
		email.InitSMTPConfiguration()
		docktor.Connect()
		server.New(Version)
	},
}

func init() {

	// Get configuration from command line flags
	serveCmd.Flags().StringP("mongo-addr", "m", "localhost:27017", "URL to access MongoDB")
	serveCmd.Flags().StringP("mongo-username", "", "", "A user which has access to MongoDB")
	serveCmd.Flags().StringP("mongo-password", "", "", "Password of the mongo user")
	serveCmd.Flags().StringP("redis-addr", "", "localhost:6379", "URL to access Redis")
	serveCmd.Flags().StringP("redis-password", "", "", "Redis password. Optional")
	serveCmd.Flags().StringP("jwt-secret", "j", "dev-docktor-secret", "Secret key used for JWT token authentication. Change it in your instance")
	serveCmd.Flags().StringP("reset-pwd-secret", "", "dev-docktor-reset-pwd-to-change", "Secret key used when resetting the password. Change it in your instance")
	serveCmd.Flags().StringP("bcrypt-pepper", "p", "dev-docktor-bcrypt", "Pepper used in password generation. Change it in your instance")
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
	serveCmd.Flags().String("ldap-attr-realname", "cn", "LDAP attribute for firstname of users.")
	serveCmd.Flags().String("ldap-attr-email", "mail", "LDAP attribute for lastname of users.")
	serveCmd.Flags().String("smtp-server", "", "SMTP server with its port.")
	serveCmd.Flags().String("smtp-user", "", "SMTP user for authentication.")
	serveCmd.Flags().String("smtp-password", "", "SMTP password for authentication.")
	serveCmd.Flags().String("smtp-sender", "", "Email used as sender of emails")
	serveCmd.Flags().String("smtp-identity", "", "Identity of the sender")

	// Bind env variables.
	_ = viper.BindPFlag("server.mongo.addr", serveCmd.Flags().Lookup("mongo-addr"))
	_ = viper.BindPFlag("server.mongo.username", serveCmd.Flags().Lookup("mongo-username"))
	_ = viper.BindPFlag("server.mongo.password", serveCmd.Flags().Lookup("mongo-password"))
	_ = viper.BindPFlag("server.redis.addr", serveCmd.Flags().Lookup("redis-addr"))
	_ = viper.BindPFlag("server.redis.password", serveCmd.Flags().Lookup("redis-password"))
	_ = viper.BindPFlag("auth.jwt-secret", serveCmd.Flags().Lookup("jwt-secret"))
	_ = viper.BindPFlag("auth.reset-pwd-secret", serveCmd.Flags().Lookup("reset-pwd-secret"))
	_ = viper.BindPFlag("auth.bcrypt-pepper", serveCmd.Flags().Lookup("bcrypt-pepper"))
	_ = viper.BindPFlag("ldap.address", serveCmd.Flags().Lookup("ldap-address"))
	_ = viper.BindPFlag("ldap.baseDN", serveCmd.Flags().Lookup("ldap-baseDN"))
	_ = viper.BindPFlag("ldap.domain", serveCmd.Flags().Lookup("ldap-domain"))
	_ = viper.BindPFlag("ldap.bindDN", serveCmd.Flags().Lookup("ldap-bindDN"))
	_ = viper.BindPFlag("ldap.bindPassword", serveCmd.Flags().Lookup("ldap-bindPassword"))
	_ = viper.BindPFlag("ldap.searchFilter", serveCmd.Flags().Lookup("ldap-searchFilter"))
	_ = viper.BindPFlag("ldap.attr.username", serveCmd.Flags().Lookup("ldap-attr-username"))
	_ = viper.BindPFlag("ldap.attr.firstname", serveCmd.Flags().Lookup("ldap-attr-firstname"))
	_ = viper.BindPFlag("ldap.attr.lastname", serveCmd.Flags().Lookup("ldap-attr-lastname"))
	_ = viper.BindPFlag("ldap.attr.realname", serveCmd.Flags().Lookup("ldap-attr-realname"))
	_ = viper.BindPFlag("ldap.attr.email", serveCmd.Flags().Lookup("ldap-attr-email"))
	_ = viper.BindPFlag("smtp.server", serveCmd.Flags().Lookup("smtp-server"))
	_ = viper.BindPFlag("smtp.user", serveCmd.Flags().Lookup("smtp-user"))
	_ = viper.BindPFlag("smtp.password", serveCmd.Flags().Lookup("smtp-password"))
	_ = viper.BindPFlag("smtp.sender", serveCmd.Flags().Lookup("smtp-sender"))
	_ = viper.BindPFlag("smtp.identity", serveCmd.Flags().Lookup("smtp-identity"))
	_ = viper.BindPFlag("env", serveCmd.Flags().Lookup("env"))
	RootCmd.AddCommand(serveCmd)

}
