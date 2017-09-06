package utils

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"

	"gopkg.in/redis.v3"
)

// GetFromRedis the value if the client exist
func GetFromRedis(client *redis.Client, key string, value interface{}) error {
	if client == nil {
		return errors.New("Redis is unavailable")
	}
	j, err := client.Get(key).Result()
	if err != nil {
		return err
	}
	err = json.Unmarshal([]byte(j), value)
	return err
}

// SetIntoRedis the value if the client exist
func SetIntoRedis(client *redis.Client, key string, value interface{}, ttl time.Duration) {
	if client == nil {
		log.Warning("Redis is unavailable")
		return
	}
	bytes, err := json.Marshal(value)
	if err != nil {
		log.WithError(err).WithFields(log.Fields{
			"value": value,
		}).Error("Invalid JSON")
		return
	}
	if err = client.Set(key, bytes, ttl).Err(); err != nil {
		log.WithError(err).WithFields(log.Fields{
			"key":   key,
			"value": string(bytes),
		}).Error("Cannot set value in Redis")
		return
	}
}

// GetRedis : retrieve redis from echo context or nil
func GetRedis(c echo.Context) *redis.Client {
	redisOrNil := c.Get("redis")
	var r *redis.Client
	if redisOrNil != nil {
		r = redisOrNil.(*redis.Client)
	}
	return r
}
