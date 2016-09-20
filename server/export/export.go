package export

import (
	"bytes"
	"fmt"
	"time"

	api "github.com/soprasteria/godocktor-api"
	"github.com/tealeg/xlsx"
)

// Export contains APIs entrypoints needed for accessing users
type Export struct {
	Docktor *api.Docktor
}

//ExportAll exports all the data as a file
func (e *Export) ExportAll() (*bytes.Reader, error) {

	var file *xlsx.File
	var sheet *xlsx.Sheet
	var row *xlsx.Row
	var cell *xlsx.Cell
	var err error

	file = xlsx.NewFile()
	sheet, err = file.AddSheet("Sheet1")
	if err != nil {
		fmt.Printf(err.Error())
	}
	row = sheet.AddRow()
	cell = row.AddCell()
	cell.Value = "I am a cell!"
	file.Save("fichier.xslx")

	var b bytes.Buffer
	file.Write(&b)

	time.Sleep(2 * time.Second)

	return bytes.NewReader(b.Bytes()), nil
}
