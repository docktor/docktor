package auth

import (
	"fmt"
	"net/mail"

	log "github.com/Sirupsen/logrus"
	"github.com/matcornic/hermes"
	"github.com/soprasteria/docktor/server/types"
	"github.com/soprasteria/docktor/server/email"
)

// SendWelcomeEmail sends a welcome email after a user's registration
func SendWelcomeEmail(user types.User) {
	emailBody := hermes.Email{
		Body: hermes.Body{
			Name: user.DisplayName,
			Intros: []string{
				"Welcome to Docktor! We're very excited to have you on board.",
			},
			Outros: []string{
				"Need help, or have questions? Just reply to this email, we'd love to help.",
			},
		},
	}

	err := email.Send(email.SendOptions{
		To: []mail.Address{
			{Name: user.DisplayName, Address: user.Email},
		},
		Subject: fmt.Sprintf("🚀 Docktor - Welcome %v !", user.FirstName),
		Body:    emailBody,
	})

	if err != nil {
		log.WithError(err).WithField("username", user.Username).Error("Failed to send welcome email")
	}
}

// SendResetPasswordEmail sends an email to a user who forgot his password
func SendResetPasswordEmail(user types.User, url string) {

	emailBody := hermes.Email{
		Body: hermes.Body{
			Name: user.DisplayName,
			Intros: []string{
				"You have received this email because a password reset request for Docktor account was received.",
			},
			Actions: []hermes.Action{
				{
					Instructions: "Click the button below to reset your password:",
					Button: hermes.Button{
						Color: "#DC4D2F",
						Text:  "Reset your password",
						Link:  url,
					},
				},
			},
			Outros: []string{
				"If you did not request a password reset, no further action is required on your part.",
			},
			Signature: "Thanks",
		},
	}

	err := email.Send(email.SendOptions{
		To: []mail.Address{
			{Name: user.DisplayName, Address: user.Email},
		},
		Subject: "⚡️ Docktor - Reset your password ",
		Body:    emailBody,
	})

	if err != nil {
		log.WithError(err).WithField("username", user.Username).Error("Failed to send reset password email")
	}
}
