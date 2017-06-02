package dockerw

import (
	"strconv"

	"github.com/soprasteria/dockerapi"
	"github.com/soprasteria/docktor/server/types"
)

// InitDocker : create a docker instance using daemon
func InitDocker(daemon types.Daemon) (*dockerapi.Client, error) {
	var api *dockerapi.Client
	var err error

	dockerHost := daemon.Protocol + "://" + daemon.Host + ":" + strconv.Itoa(daemon.Port)
	if daemon.Cert == "" {
		api, err = dockerapi.NewClient(dockerHost)
	} else {
		params := dockerapi.TLSClientFromBytesParameters{
			Host:               dockerHost,
			CertPEMBlock:       []byte(daemon.Cert),
			KeyPEMBlock:        []byte(daemon.Key),
			CaPEMCert:          []byte(daemon.Ca),
			InsecureSkipVerify: false,
		}
		api, err = dockerapi.NewTLSClientFromBytes(params)
	}
	return api, err
}
