package email

import (
	"errors"
	"fmt"
	"net/mail"
	"strings"

	log "github.com/sirupsen/logrus"
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

		// Logo of Docktor as base64
		logo := "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASMAAAEjCAMAAABO/pcfAAACQFBMVEUAAAD////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////zzJ0OAAAAv3RSTlMAAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdJSktMTU5PUFFSVFVWV1hZW1xdXl9hYmNkZmdoaWtsbW9wcXN0dXd4eXt8fn+AgoOFhoiJi4yOj5GSlJWXmJqbnZ6goqOlpqiqq62vsLK0tbe5ury+wMHDxcfIyszOz9HT1dfZ2tze4OLk5ujp6+3v8fP19/n7/astjCAAABB5SURBVBgZ7cGJY5NVvgbg93xJmqahsgVbSmVVBgtU5o5KZVTu6HUHF3ABBQEHdUSRYQS9CgqISpQCosi+KKtCLUv3Nsn7r925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"
		if viper.GetString("smtp.logo") != "" {
			// Override default logo from configuration
			logo = viper.GetString("smtp.logo")
		}

		hermesConfig = hermes.Hermes{
			Theme: new(hermes.Flat),
			Product: hermes.Product{
				Name:      "Docktor",
				Logo:      logo,
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
