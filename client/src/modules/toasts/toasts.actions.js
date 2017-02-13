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

const confirmSave = (name) => {
  return {
    type: ToastsConstants.COMFIRM_SAVE,
    name
  };
};

export default {
  confirmDeletion,
  closeNotification,
  confirmSave
};
