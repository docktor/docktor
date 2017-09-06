package server

import (
	"errors"
	"strings"

	"github.com/go-playground/locales/en"
	ut "github.com/go-playground/universal-translator"
	validator "gopkg.in/go-playground/validator.v9"
	en_translations "gopkg.in/go-playground/validator.v9/translations/en"
)

// CustomValidator allows Echo server to check fields of REST entities
type CustomValidator struct {
	validator *validator.Validate
	trans     ut.Translator
}

// newValidator creates a new validator with english language
func newValidator() *CustomValidator {
	// Use english language by default
	en := en.New()
	uni := ut.New(en, en)
	trans, _ := uni.GetTranslator("en")
	validate := validator.New()
	en_translations.RegisterDefaultTranslations(validate, trans)

	return &CustomValidator{
		validator: validate,
		trans:     trans,
	}
}

// Validate checks the given object and returns an error if at least one field is wrong
func (cv *CustomValidator) Validate(i interface{}) error {

	err := cv.validator.Struct(i)
	if err != nil {
		errs := err.(validator.ValidationErrors)
		errMessages := []string{}
		for _, v := range errs.Translate(cv.trans) {
			errMessages = append(errMessages, v)
		}
		return errors.New(strings.Join(errMessages, ", "))
	}
	return nil

}
