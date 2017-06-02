package controllers

import (
	"fmt"
	"io"
	"mime"
	"net/http"
	"time"

	"github.com/labstack/echo"
	"github.com/soprasteria/docktor/server/models"
	"github.com/soprasteria/docktor/server/modules/export"
)

// Export contains all handlers for exporting data as csv/xlsx and so on
type Export struct {
}

//ExportAll exports all the data as a file
func (a *Export) ExportAll(c echo.Context) error {
	docktorAPI := c.Get("api").(*models.Docktor)
	exporter := export.Export{Docktor: docktorAPI}

	data, err := exporter.ExportAll()
	if err != nil {
		return c.String(http.StatusInternalServerError, "Can't export docktor data in a file")
	}

	return serveContent(c, data, fmt.Sprintf("DocktorExport-%s.xlsx", time.Now()), time.Now())
}

func serveContent(c echo.Context, content io.ReadSeeker, name string, modtime time.Time) error {
	req := c.Request()
	res := c.Response()

	if t, err := time.Parse(http.TimeFormat, req.Header.Get("If-Modified-Since")); err == nil && modtime.Before(t.Add(1*time.Second)) {
		res.Header().Del("Content-Type")
		res.Header().Del("Content-Length")
		return c.NoContent(http.StatusNotModified)
	}

	res.Header().Set("Content-Type", mime.TypeByExtension(name))
	res.Header().Set("Last-Modified", modtime.UTC().Format(http.TimeFormat))
	res.WriteHeader(http.StatusOK)
	_, err := io.Copy(res, content)
	return err
}
