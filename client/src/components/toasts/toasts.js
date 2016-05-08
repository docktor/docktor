// React
import React from 'react'
import NotificationSystem from 'react-notification-system'
import { connect } from 'react-redux'

// Actions for redux container
import { closeNotification } from '../../actions/toasts.actions.js'

// Notifications Component
class Notifications extends React.Component {
    constructor() {
        super()
        this.notificationSystem = null
    }

    addNotification(notification) {
        let toast = notification
        toast.onRemove = () => this.props.onClose(notification.uid)
        this.notificationSystem.addNotification(toast)
    }

    componentDidMount() {
        this.notificationSystem = this.refs.notificationSystem;
    }
    
    componentDidUpdate() {
        const toasts = this.props.toasts
        console.dir(toasts)
        Object.keys(toasts).forEach( id => this.addNotification(toasts[id]))
    }

    render() {
        return (
            <NotificationSystem ref="notificationSystem" />
        )
    }
}

// Function to map state to container props
const mapStateToNotificationsProps = (state) => {
  return { toasts: state.toasts }
}

// Function to map dispatch to container props
const mapDispatchToNotificationsProps = (dispatch) => {
  return { onClose : id => dispatch(closeNotification(id)) }
}

// Redux container to Sites component
const Toasts = connect(
  mapStateToNotificationsProps,
  mapDispatchToNotificationsProps
)(Notifications)

export default Toasts