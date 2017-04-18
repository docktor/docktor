package controllers

import "errors"

// ErrNotAuthorized is an error when someone is trying to access unauthorized ressource for a given role
var ErrNotAuthorized = errors.New("You're trying to access unauthorized ressources for your role")
