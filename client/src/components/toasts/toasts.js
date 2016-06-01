// React
import React from 'react'
import NotificationSystem from 'react-notification-system'
import { connect } from 'react-redux'

// Actions for redux container
import { closeNotification } from '../../actions/toasts.actions.js'

// Style 
import './toasts.scss'

// Notifications Component
class Toasts extends React.Component {
    constructor() {
        super()
        this.notificationSystem = null
        this.toastsToRemove = []
    }

    addNotification(notification) {
        let toast = notification
        toast.onRemove = () => this.props.onClose(notification.uid)
        toast = this.notificationSystem.addNotification(toast)
        this.toastsToRemove.push(toast)
    }

    componentDidMount() {
        this.notificationSystem = this.refs.notificationSystem
    }

    componentDidUpdate() {
        const toasts = this.props.toasts
        this.toastsToRemove.forEach((toastToRemove, index) => {
            const find = toasts[toastToRemove.uid]
            if (!find) {
                this.notificationSystem.removeNotification(toastToRemove)
                this.toastsToRemove.splice(index, 1)
            }
        })
        Object.keys(toasts).forEach(id => this.addNotification(toasts[id]))
    }

    render() {
        const style = {
            ActionWrapper: {
                DefaultStyle: {
                    paddingLeft: 185
                }
            }
        };
        return (
            <NotificationSystem ref='notificationSystem' style={style} />
        )
    }
}

// Function to map state to container props
const mapStateToNotificationsProps = (state) => {
    return { toasts: state.toasts }
}

// Function to map dispatch to container props
const mapDispatchToNotificationsProps = (dispatch) => {
    return { onClose: id => dispatch(closeNotification(id)) }
}

// Redux container to Sites component
const ToastsContainer = connect(
    mapStateToNotificationsProps,
    mapDispatchToNotificationsProps
)(Toasts)

export default ToastsContainer