package controllers

import "errors"

var ErrNotAuthorized = errors.New("You're trying to access unauthorized ressources for your role")

// RestResponse return ID of deleted entity
type RestResponse struct {
	ID string `json:"id"`
}
