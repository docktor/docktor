package email

import (
	"encoding/base64"
	"errors"
	"fmt"
	"net/mail"
	"net/smtp"
	"strings"

	"github.com/spf13/viper"
)

type smtpAuthentication struct {
	Server          string
	SMTPAuthentData smtp.Auth
	Enabled         bool
	SenderEmail     string
	SenderIdentity  string
}

var smtpConfig smtpAuthentication

func InitSMTPConfiguration() {
	server := viper.GetString("smtp.server")
	if server != "" {
		// SMTP server is configured, enabling it.
		smtpConfig.Enabled = true
		smtpConfig.Server = server

		sender := viper.GetString("smtp.sender")
		if sender == "" {
			sender = viper.GetString("smtp.user")
		}
		smtpConfig.SenderEmail = sender
		smtpConfig.SenderIdentity = viper.GetString("smtp.identity")

		user := viper.GetString("smtp.user")
		if user != "" {
			// SMTP configuration defines user/password for SMTP authentication
			smtpConfig.SMTPAuthentData = smtp.PlainAuth(
				"",
				user,
				viper.GetString("smtp.password"),
				strings.Split(viper.GetString("smtp.server"), ":")[0],
			)
		}
	}
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

func encodeRFC2047(String string) string {
	// use mail's rfc2047 to encode any string
	addr := mail.Address{Name: String, Address: ""}
	return strings.Trim(addr.String(), " <>")
}

// SendOptions are options for sending an email
type SendOptions struct {
	To      []mail.Address
	Subject string
	Body    string
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

	header := make(map[string]string)
	header["From"] = from.String()
	header["To"] = strings.Join(recipientsToString(options.To), ";")
	header["Subject"] = options.Subject
	header["MIME-Version"] = "1.0"
	header["Content-Type"] = "text/plain; charset=\"utf-8\""
	header["Content-Transfer-Encoding"] = "base64"

	message := ""
	for k, v := range header {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + base64.StdEncoding.EncodeToString([]byte(options.Body))

	fmt.Println(smtpConfig.Server)
	fmt.Println(smtpConfig.SMTPAuthentData)
	fmt.Println(smtpConfig.SenderEmail)
	fmt.Println(recipientsAddress(options.To))

	err := smtp.SendMail(
		smtpConfig.Server,
		smtpConfig.SMTPAuthentData,
		smtpConfig.SenderEmail,
		recipientsAddress(options.To),
		[]byte(message),
	)
	return err
}
