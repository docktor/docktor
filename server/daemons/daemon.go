package daemons

import (
	"time"

	"github.com/fsouza/go-dockerclient"
	"github.com/soprasteria/docktor/server/dockerw"
	"github.com/soprasteria/docktor/server/redisw"
	"github.com/soprasteria/godocktor-api/types"
	"gopkg.in/redis.v3"
)

// GetInfo : retrieving the docker daemon status using redis cache
func GetInfo(daemon types.Daemon, client *redis.Client) (*docker.DockerInfo, error) {

	var info *docker.DockerInfo
	key := daemon.ID.Hex()

	err := redisw.Get(client, key, info)
	if err == nil {
		return info, nil
	}
	api, err := dockerw.InitDocker(daemon)
	if err != nil {
		return nil, err
	}

	info, err = api.Docker.Info()
	if err != nil {
		return nil, err
	}
	go redisw.Set(client, key, info, 60*time.Second)
	return info, nil
}
