package export

import "github.com/tealeg/xlsx"

// XLSXTable represents a classic table, with a header of a single line, and a list of rows containing the data
// This type aims to simplify the insertion of data with XLSX API
type XLSXTable struct {
	sheet *xlsx.Sheet
}

// NewTable creates a new table for a XLSX sheet
func NewTable(sheet *xlsx.Sheet) *XLSXTable {
	return &XLSXTable{
		sheet: sheet,
	}
}

// SetHeader sets the header of the table, from a list a labels
func (table *XLSXTable) SetHeader(header []string) {
	xlsxHeader := table.sheet.AddRow()
	cellStyle := xlsx.NewStyle()
	cellStyle.Font.Bold = true
	cellStyle.Alignment.WrapText = true
	for _, c := range header {
		cell := xlsxHeader.AddCell()
		cell.SetValue(c)
		cell.SetStyle(cellStyle)
	}
}

// Append adds a row with the content of the slice parameter
func (table *XLSXTable) Append(row []interface{}) {
	xlsxRow := table.sheet.AddRow()
	for _, c := range row {
		cell := xlsxRow.AddCell()
		cell.SetValue(c)
	}
}

// AppendBulk append all the cells in the table from a slice of two dimensions
// Very straightforward method to add data.
func (table *XLSXTable) AppendBulk(rows [][]interface{}) {
	for _, row := range rows {
		table.Append(row)
	}
}
