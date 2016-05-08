// Close Notifications
export const CLOSE_NOTIFICATION = 'CLOSE_NOTIFICATION'

export function closeNotification(id) {
  return {
    type: CLOSE_NOTIFICATION,
    id
  }
}