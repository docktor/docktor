// Request all daemons
export const REQUEST_ALL_DAEMONS = 'REQUEST_ALL_DAEMONS';

export function requestAllDaemons() {
  return {
    type: REQUEST_ALL_DAEMONS
  };
}


// Daemons are received
export const RECEIVE_DAEMONS = 'RECEIVE_DAEMONS';

export function receiveDaemons(daemons) {
  return {
    type: RECEIVE_DAEMONS,
    daemons,
    receivedAt: Date.now()
  };
}

// Daemons API returns an Error
export const INVALID_REQUEST_DAEMONS = 'INVALID_REQUEST_DAEMONS';

export function invalidRequestDaemons(error) {
  return {
    type: INVALID_REQUEST_DAEMONS,
    error
  };
}

// Request daemon info
export const REQUEST_DAEMON_INFO = 'REQUEST_DAEMON_INFO';

export function requestDaemonInfo(daemon) {
  return {
    type: REQUEST_DAEMON_INFO,
    daemon
  };
}


// Daemon info are received
export const RECEIVE_DAEMON_INFO = 'RECEIVE_DAEMON_INFO';

export function receiveDaemonInfo(daemon, info) {
  return {
    type: RECEIVE_DAEMON_INFO,
    daemon,
    info
  };
}

// Daemon info API returns an Error
export const INVALID_REQUEST_DAEMON_INFO = 'INVALID_REQUEST_DAEMON_INFO';

export function invalidRequestDaemonInfo(daemon) {
  return function(error) {
    return {
    type: INVALID_REQUEST_DAEMON_INFO,
    daemon,
    error
    };
  };
}
