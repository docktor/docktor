// import constants
import ToastsConstants from './toasts.constants.js';

// Confirm site deletion
export function confirmDeletion(title, callback) {
  return {
    type: ToastsConstants.COMFIRM_DELETION,
    title,
    callback
  };
}

// Close Notifications
export function closeNotification(id) {
  return {
    type: ToastsConstants.CLOSE_NOTIFICATION,
    id
  };
}
