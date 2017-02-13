package controllers

import (
	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/websocket"
	"github.com/labstack/echo"
	"net/http"
)

type Websocket struct {
}

var upgrader = websocket.Upgrader{}

//Delete daemon into docktor
func (d *Websocket) Open(c echo.Context) error {
	conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		log.WithError(err).Error("Can't upgrade websocket")
		return c.String(http.StatusBadRequest, "Can't upgrade websocket : "+err.Error())
	}
	defer conn.Close()
	for {
		mt, message, err := conn.ReadMessage()
		if err != nil {
			log.WithError(err).Debug("read:", err)
			break
		}
		log.Printf("recv: %s", message)
		err = conn.WriteMessage(mt, message)
		if err != nil {
			log.Println("write:", err)
			break
		}
	}
	return nil
}
