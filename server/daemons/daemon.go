package daemons

import (
	"strconv"
	"time"

	"github.com/soprasteria/dockerapi"
	"github.com/soprasteria/godocktor-api/types"
	"gopkg.in/redis.v3"
)

// CheckHealth ping the docker daemon status using redis cache
func CheckHealth(daemon types.Daemon, redisClient *redis.Client) error {

	_, err := redisClient.Get(daemon.ID.Hex()).Result()
	if err == nil {
		return nil
	}

	dockerHost := daemon.Protocol + "://" + daemon.Host + ":" + strconv.Itoa(daemon.Port)
	var api *dockerapi.Client
	if daemon.Cert == "" {
		api, err = dockerapi.NewClient(daemon.Host)
	} else {
		api, err = dockerapi.NewTLSClient(dockerHost, daemon.Cert, daemon.Key, daemon.Ca)
	}
	if err != nil {
		return err
	}
	infos, err := api.Docker.Info()
	if err != nil {
		return err
	}

	err = redisClient.Set(daemon.ID.Hex(), infos, 5*time.Minute).Err()
	if err != nil {
		return err
	}
	return nil
}
