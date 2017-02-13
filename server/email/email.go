package email

import (
	"errors"
	"fmt"
	"net/mail"
	"strings"

	log "github.com/Sirupsen/logrus"
	"github.com/matcornic/hermes"
	"github.com/spf13/viper"
	"gopkg.in/gomail.v2"
	"strconv"
)

type smtpAuthentication struct {
	Server         string
	Port           int
	Enabled        bool
	SenderEmail    string
	SenderIdentity string
	SMTPUser       string
	SMTPPassword   string
}

var smtpConfig smtpAuthentication
var hermesConfig hermes.Hermes

// InitSMTPConfiguration initializes the SMTP configuration from the smtp.* parameters
func InitSMTPConfiguration() error {
	server := viper.GetString("smtp.server")
	if server != "" {
		// SMTP server is configured, enabling it.
		smtpConfig.Enabled = true
		s, port, err := getServerAndPort(server)
		if err != nil {
			return err
		}
		smtpConfig.Server = s
		smtpConfig.Port = port

		sender := viper.GetString("smtp.sender")
		if sender == "" {
			sender = viper.GetString("smtp.user")
		}
		smtpConfig.SenderEmail = sender
		smtpConfig.SenderIdentity = viper.GetString("smtp.identity")

		user := viper.GetString("smtp.user")
		if user != "" {
			// SMTP configuration defines user/password for SMTP authentication
			smtpConfig.SMTPUser = user
			smtpConfig.SMTPPassword = viper.GetString("smtp.password")
		}

		hermesConfig = hermes.Hermes{
			Product: hermes.Product{
				// Appears in header & footer of e-mails
				Name: "Docktor",
				// Optional product logo
				Logo:      "http://www.duchess-france.org/wp-content/uploads/2016/01/gopher.png",
				Copyright: "Copyright © 2017 Docktor. All rights reserved.",
			},
		}
	}
	return nil
}

func getServerAndPort(serverAndPort string) (string, int, error) {
	// Get server and
	sap := strings.Split(serverAndPort, ":")
	if len(sap) != 2 {
		return "", 0, fmt.Errorf("Expected format of smtp.server value: 'domain:port' (where port is a number). Obtained %v", serverAndPort)
	}
	portString := sap[1]
	p, err := strconv.Atoi(portString)
	if err != nil {
		return "", 0, fmt.Errorf("Port in smtp.server is not valid. Expected a number and obtained %v. Error: %v", portString, err.Error())
	}

	return sap[0], p, nil
}

func recipientsAddress(adresses []mail.Address) []string {
	var recipients []string
	for _, addr := range adresses {
		recipients = append(recipients, addr.Address)
	}
	return recipients
}

func recipientsToString(adresses []mail.Address) []string {
	var recipients []string
	for _, addr := range adresses {
		recipients = append(recipients, addr.String())
	}
	return recipients
}

// SendOptions are options for sending an email
type SendOptions struct {
	To      []mail.Address
	Subject string
	Body    hermes.Email
}

// Send sends the email
func Send(options SendOptions) error {

	if !smtpConfig.Enabled {
		return errors.New("Can't send email because SMTP is disabled. Please, add SMTP configuration. Check 'server --help' to configure")
	}

	from := mail.Address{
		Name:    smtpConfig.SenderIdentity,
		Address: smtpConfig.SenderEmail,
	}

	m := gomail.NewMessage()
	m.SetHeader("From", from.String())
	m.SetHeader("To", recipientsToString(options.To)...)
	m.SetHeader("Subject", options.Subject)

	emailBodyHTML, err := hermesConfig.GenerateHTML(options.Body)
	if err != nil {
		return err
	}

	// Generate the plaintext version of the e-mail (for clients that do not support xHTML)
	emailBodyPlainText, err := hermesConfig.GeneratePlainText(options.Body)
	if err != nil {
		return err
	}

	m.SetBody("text/plain", emailBodyPlainText)
	m.AddAlternative("text/html", emailBodyHTML)

	log.WithFields(log.Fields{
		"server":      smtpConfig.Server,
		"senderEmail": smtpConfig.SenderEmail,
		"recipient":   recipientsAddress(options.To),
	}).Debug("SMTP server configuration")

	d := gomail.NewDialer(smtpConfig.Server, smtpConfig.Port, smtpConfig.SMTPUser, smtpConfig.SMTPPassword)

	return d.DialAndSend(m)
}
