// import constants
import ToastsConstants from './toasts.constants';

// Confirm site deletion
const confirmDeletion = (title, callback) => {
  return {
    type: ToastsConstants.COMFIRM_DELETION,
    title,
    callback
  };
};

// Close Notifications
const closeNotification = (id) => {
  return {
    type: ToastsConstants.CLOSE_NOTIFICATION,
    id
  };
};

export default {
  confirmDeletion,
  closeNotification
};
