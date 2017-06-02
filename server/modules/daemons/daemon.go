package daemons

import (
	"time"

	"github.com/soprasteria/docktor/server/types"
	"github.com/soprasteria/docktor/server/wrappers/dockerw"
	"github.com/soprasteria/docktor/server/wrappers/redisw"
	"gopkg.in/redis.v3"
)

// DaemonInfo struct
type DaemonInfo struct {
	Status       string `json:"status"`
	NbImages     int    `json:"nbImages"`
	NbContainers int    `json:"nbContainers"`
	Message      string `json:"message,omitempty"`
}

const (
	statusUP   string = "UP"
	statusDOWN string = "DOWN"
)

// GetInfo : retrieving the docker daemon status using redis cache
func GetInfo(daemon types.Daemon, client *redis.Client, force bool) (*DaemonInfo, error) {
	info := &DaemonInfo{}
	key := daemon.ID.Hex()
	if !force {
		err := redisw.Get(client, key, info)
		if err == nil {
			return info, nil
		}
	}

	api, err := dockerw.InitDocker(daemon)
	if err != nil {
		return nil, err
	}

	dockerInfo, err := api.Docker.Info()
	if err != nil {
		info = &DaemonInfo{Status: statusDOWN, NbImages: 0, NbContainers: 0, Message: err.Error()}
		go redisw.Set(client, key, info, 5*time.Minute)
		return info, nil
	}

	info = &DaemonInfo{Status: statusUP, NbImages: dockerInfo.Images, NbContainers: dockerInfo.Containers}
	go redisw.Set(client, key, info, 5*time.Minute)
	return info, nil
}
