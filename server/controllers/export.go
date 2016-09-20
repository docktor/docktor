package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/labstack/echo"
	"github.com/soprasteria/docktor/server/export"
	api "github.com/soprasteria/godocktor-api"
)

// Export contains all handlers for exporting data as csv/xlsx and so on
type Export struct {
}

//ExportAll exports all the data as a file
func (a *Export) ExportAll(c echo.Context) error {
	docktorAPI := c.Get("api").(*api.Docktor)
	exporter := export.Export{Docktor: docktorAPI}

	data, err := exporter.ExportAll()
	if err != nil {
		return c.String(http.StatusInternalServerError, "Can't export docktor data in a file")
	}
	return c.ServeContent(data, fmt.Sprintf("DocktorExport-%s.xlsx", time.Now()), time.Now())
}
