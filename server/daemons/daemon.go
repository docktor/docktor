package daemons

import (
	"time"

	"github.com/soprasteria/docktor/server/dockerw"
	"github.com/soprasteria/docktor/server/redisw"
	"github.com/soprasteria/godocktor-api/types"
	"gopkg.in/redis.v3"
)

// DaemonInfo struct
type DaemonInfo struct {
	Status     string `json:"status"`
	Images     int    `json:"images"`
	Containers int    `json:"containers"`
	Message    string `json:"message,omitempty"`
}

// GetInfo : retrieving the docker daemon status using redis cache
func GetInfo(daemon types.Daemon, client *redis.Client, force bool) (*DaemonInfo, error) {
	info := &DaemonInfo{}
	key := daemon.ID.Hex()
	if force == false {
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
		info = &DaemonInfo{Status: "DOWN", Images: 0, Containers: 0, Message: err.Error()}
		go redisw.Set(client, key, info, 5*time.Minute)
		return info, nil
	}

	info = &DaemonInfo{Status: "UP", Images: dockerInfo.Images, Containers: dockerInfo.Containers}
	go redisw.Set(client, key, info, 5*time.Minute)
	return info, nil
}
