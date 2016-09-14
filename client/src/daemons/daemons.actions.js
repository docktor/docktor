// import constants
import DaemonsConstants from './daemons.constants.js';

// Request all daemons
export function requestAllDaemons() {
  return {
    type: DaemonsConstants.REQUEST_ALL_DAEMONS
  };
}

// Daemons are received
export function receiveDaemons(daemons) {
  return {
    type: DaemonsConstants.RECEIVE_DAEMONS,
    daemons,
    receivedAt: Date.now()
  };
}

// Daemons API returns an Error
export function invalidRequestDaemons(error) {
  return {
    type: DaemonsConstants.INVALID_REQUEST_DAEMONS,
    error
  };
}

// Request daemon info
export function requestDaemonInfo(daemon) {
  return {
    type: DaemonsConstants.REQUEST_DAEMON_INFO,
    daemon
  };
}


// Daemon info are received
export function receiveDaemonInfo(daemon, info) {
  return {
    type: DaemonsConstants.RECEIVE_DAEMON_INFO,
    daemon,
    info
  };
}

// Daemon info API returns an Error
export function invalidRequestDaemonInfo(daemon) {
  return function(error) {
    return {
    type: DaemonsConstants.INVALID_REQUEST_DAEMON_INFO,
    daemon,
    error
    };
  };
}
