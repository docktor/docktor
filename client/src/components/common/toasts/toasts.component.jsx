// React
import React from 'react';
import NotificationSystem from 'react-notification-system';
import { connect } from 'react-redux';

// Actions for redux container
import ToastsActions from '../../../modules/toasts/toasts.actions';

// Style
import './toasts.component.scss';

// Notifications Component
class Toasts extends React.Component {

  notificationSystem = null;
  toastsToRemove = [];

  componentDidMount = () => {
    this.notificationSystem = this.refs.notificationSystem;
  }

  componentDidUpdate = () => {
    const toasts = this.props.toasts;
    this.toastsToRemove.forEach((toastToRemove, index) => {
      const find = toasts[toastToRemove.uid];
      if (!find) {
        this.notificationSystem.removeNotification(toastToRemove);
        this.toastsToRemove.splice(index, 1);
      }
    });
    Object.values(toasts).forEach(toast => this.addNotification(toast));
  }

  addNotification = (notification) => {
    let toast = notification;
    toast.onRemove = () => this.props.onClose(notification.uid);
    toast = this.notificationSystem.addNotification(toast);
    this.toastsToRemove.push(toast);
  }

  render = () => {
    const style = {
      ActionWrapper: {
        DefaultStyle: {
          paddingLeft: 185
        }
      }
    };
    return (
      <NotificationSystem ref='notificationSystem' style={style} />
    );
  }
}

Toasts.propTypes = { toasts: React.PropTypes.object, onClose:React.PropTypes.func };

// Function to map state to container props
const mapStateToNotificationsProps = (state) => {
  return { toasts: state.toasts };
};

// Function to map dispatch to container props
const mapDispatchToNotificationsProps = (dispatch) => {
  return { onClose: id => dispatch(ToastsActions.closeNotification(id)) };
};

// Redux container to Sites component
const ToastsContainer = connect(
    mapStateToNotificationsProps,
    mapDispatchToNotificationsProps
)(Toasts);

export default ToastsContainer;
