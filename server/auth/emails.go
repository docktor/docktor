package auth

import (
	"fmt"
	"github.com/soprasteria/docktor/server/email"
	"github.com/soprasteria/godocktor-api/types"
	"net/mail"
)

func SendWelcomeEmail(user types.User) error {

	return email.Send(email.SendOptions{
		To: []mail.Address{
			{Name: user.DisplayName, Address: user.Email},
		},
		Subject: "Welcome to Docktor",
		Body:    "Your account has been created !",
	})
}

func SendResetPasswordEmail(user types.User, url string) error {
	return email.Send(email.SendOptions{
		To: []mail.Address{
			{Name: user.DisplayName, Address: user.Email},
		},
		Subject: "Forgot your password ?",
		Body:    fmt.Sprintf("Your password has been reset and you can change it by following the link %s ", url),
	})
}
