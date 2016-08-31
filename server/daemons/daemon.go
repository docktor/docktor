package daemons

import (
	"encoding/json"
	"strconv"
	"time"

	"github.com/fsouza/go-dockerclient"
	"github.com/soprasteria/dockerapi"
	"github.com/soprasteria/godocktor-api/types"
	"gopkg.in/redis.v3"
)

// GetInfo : retrieving the docker daemon status using redis cache
func GetInfo(daemon types.Daemon, redisClient *redis.Client) (*docker.DockerInfo, error) {

	infosJSON, err := redisClient.Get(daemon.ID.Hex()).Result()
	if err == nil {
		var infos docker.DockerInfo
		errUnmarshal := json.Unmarshal([]byte(infosJSON), &infos)
		if errUnmarshal == nil {
			return &infos, nil
		}
	}

	dockerHost := daemon.Protocol + "://" + daemon.Host + ":" + strconv.Itoa(daemon.Port)
	var api *dockerapi.Client
	if daemon.Cert == "" {
		api, err = dockerapi.NewClient(daemon.Host)
	} else {
		api, err = dockerapi.NewTLSClient(dockerHost, daemon.Cert, daemon.Key, daemon.Ca)
	}
	if err != nil {
		return nil, err
	}

	infos, err := api.Docker.Info()
	if err != nil {
		return nil, err
	}

	bytes, err := json.Marshal(infos)
	if err == nil {
		redisClient.Set(daemon.ID.Hex(), bytes, 5*time.Minute).Err()
	}
	return infos, nil
}
