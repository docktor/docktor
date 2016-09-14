// import constants
import DaemonConstants from './daemon.constants.js';

// Request a daemons
export function requestDaemon(id) {
  return {
    type: DaemonConstants.REQUEST_DAEMON,
    id
  };
}


// Daemon is received
export function receiveDaemon(daemon) {
  return {
    type: DaemonConstants.RECEIVE_DAEMON,
    daemon
  };
}

// Daemon API returns an Error
export function invalidRequestDaemon(error) {
  return {
    type: DaemonConstants.INVALID_REQUEST_DAEMON,
    error
  };
}
