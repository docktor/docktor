// Confirm site deletion
export const COMFIRM_DELETION = 'COMFIRM_DELETION';

export function confirmDeletion(title, callback) {
  return {
    type: COMFIRM_DELETION,
    title,
    callback
  };
}



// Close Notifications
export const CLOSE_NOTIFICATION = 'CLOSE_NOTIFICATION';

export function closeNotification(id) {
  return {
    type: CLOSE_NOTIFICATION,
    id
  };
}
