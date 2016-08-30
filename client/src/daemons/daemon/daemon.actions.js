// Request a daemons
export const REQUEST_DAEMON = 'REQUEST_DAEMON';
export function requestDaemon(id) {
  return {
    type: REQUEST_DAEMON,
    id
  };
}


// Daemon is received
export const RECEIVE_DAEMON = 'RECEIVE_DAEMON';
export function receiveDaemon(daemon) {
  return {
    type: RECEIVE_DAEMON,
    daemon
  };
}

// Daemon API returns an Error
export const INVALID_REQUEST_DAEMON = 'INVALID_REQUEST_DAEMON';
export function invalidRequestDaemon(error) {
  return {
    type: INVALID_REQUEST_DAEMON,
    error
  };
}
