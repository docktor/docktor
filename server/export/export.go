package export

import (
	"bytes"
	"fmt"

	api "github.com/soprasteria/docktor/model"
	"github.com/soprasteria/docktor/model/types"
	"github.com/tealeg/xlsx"
)

// Export contains APIs entrypoints needed for accessing users
type Export struct {
	Docktor *api.Docktor
}

//ExportAll exports all business data as a file
func (e *Export) ExportAll() (*bytes.Reader, error) {

	file := xlsx.NewFile()

	sites, err := e.Docktor.Sites().FindAll()
	if err != nil {
		return nil, err
	}
	daemons, err := e.Docktor.Daemons().FindAll()
	if err != nil {
		return nil, err
	}
	_, err = e.addDaemonSheet(file, daemons, sites)
	if err != nil {
		return nil, err
	}

	groups, err := e.Docktor.Groups().FindAll()
	if err != nil {
		return nil, err
	}
	_, err = e.addGroupSheet(file, groups, daemons, sites)
	if err != nil {
		return nil, err
	}

	// Write the file in-memory and returns is as a readable stream
	var b bytes.Buffer
	file.Write(&b)
	return bytes.NewReader(b.Bytes()), nil
}

// Add a daemon sheet containing all daemons of Docktor
func (e *Export) addDaemonSheet(file *xlsx.File, daemons []types.Daemon, sites []types.Site) (*xlsx.Sheet, error) {
	// Create the daemons sheet
	sheet, err := file.AddSheet("Daemons")
	if err != nil {
		return nil, err
	}
	table := NewTable(sheet)

	// Add a header
	table.SetHeader([]string{"Id", "Name", "Host", "Site", "Description", "Creation date"})

	// Add data
	data := [][]interface{}{}
	for _, daemon := range daemons {
		// Search in the slice of slices already fetched instead of requesting the database for performance purpose
		site, err := findSite(daemon.Site.Hex(), sites)
		siteName := "Unknown"
		if err == nil {
			siteName = site.Title
		}
		data = append(data, []interface{}{
			daemon.ID.Hex(),
			daemon.Name,
			daemon.Host,
			siteName,
			daemon.Description,
			daemon.Created,
		})
	}
	table.AppendBulk(data)

	return sheet, nil
}

// addGroupSheet adds
func (e *Export) addGroupSheet(file *xlsx.File, groups []types.Group, daemons []types.Daemon, sites []types.Site) (*xlsx.Sheet, error) {
	// Create the groups sheet
	sheet, err := file.AddSheet("Groups")
	if err != nil {
		return nil, err
	}
	table := NewTable(sheet)

	// Add a header
	table.SetHeader([]string{"Group Id", "Group Name", "Group Description", "Group creation date", "Service", "Service version", "Service name", "Daemon ID", "Daemon name", "Daemon site"})

	// Add data
	// TODO : add tags when tags are on groups
	data := [][]interface{}{}
	for _, group := range groups {
		if len(group.Containers) == 0 {
			// Create a group line with empty service when no container created for group
			data = append(data, []interface{}{
				group.ID.Hex(),
				group.Title,
				group.Description,
				group.Created,
			})
		} else {
			for _, container := range group.Containers {
				// Search in the slice of daemons already fetched instead of requesting the database for performance purpose
				daemon, err := findDaemon(container.DaemonID, daemons)
				daemonName := "Unknown"
				siteName := daemonName
				if err == nil {
					daemonName = daemon.Name
					site, err := findSite(daemon.Site.Hex(), sites)
					if err == nil {
						siteName = site.Title
					}
				}

				data = append(data, []interface{}{
					group.ID.Hex(),
					group.Title,
					group.Description,
					group.Created,
					container.ServiceTitle,
					container.Image,
					container.Name,
					container.DaemonID,
					daemonName,
					siteName,
				})
			}
		}
	}
	table.AppendBulk(data)

	return sheet, nil
}

func findDaemon(id string, daemons []types.Daemon) (types.Daemon, error) {
	for _, d := range daemons {
		if d.ID.Hex() == id {
			return d, nil
		}
	}
	return types.Daemon{}, fmt.Errorf("Can't find daemon of id %v", id)
}

func findSite(id string, sites []types.Site) (types.Site, error) {
	for _, s := range sites {
		if s.ID.Hex() == id {
			return s, nil
		}
	}
	return types.Site{}, fmt.Errorf("Can't find site of id %v", id)
}
