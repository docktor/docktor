package engine

import "fmt"
import log "github.com/Sirupsen/logrus"

// NotificationBus is a bus of notifications, where message can be pushed
type NotificationBus chan NotificationMessage

// NotificationMessage is a message that can be sent to the notification bus
type NotificationMessage struct {
	Message string
	Level   string
}

func (nm NotificationMessage) String() string {
	return fmt.Sprintf("[%v] %v", nm.Level, nm.Message)
}

// Send sends the given message to the notification bus
// Be aware that the message has to be consume for this method to return
func (nb NotificationBus) Send(message NotificationMessage, entity DeployableEntity) {
	defer func() {
		if r := recover(); r != nil {
			log.WithField("message", message).Warnf("Notification sending panicked : %v", r)
		}
	}()
	if nb != nil {
		nb <- message
	}
	err := entity.StoreMessage(message)
	if err != nil {
		log.WithError(err).WithField("entity", entity).Warn("Can't store log of entity")
	}
}
