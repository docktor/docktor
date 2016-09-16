// import constants
import DaemonConstants from './daemon.constants.js';

// Request a daemons
const requestDaemon = (id) => {
  return {
    type: DaemonConstants.REQUEST_DAEMON,
    id
  };
};

// Daemon is received
const receiveDaemon = (daemon) => {
  return {
    type: DaemonConstants.RECEIVE_DAEMON,
    daemon
  };
};

// Request to save a daemon
const requestSaveDaemon = (daemon) => {
  return {
    type: DaemonConstants.REQUEST_SAVE_DAEMON,
    daemon
  };
};

// Daemon is saved
const savedDaemon = (daemon) => {
  return {
    type: DaemonConstants.SAVED_DAEMON,
    daemon
  };
};

// Daemon API returns an Error
const invalidRequestDaemon = (error) => {
  return {
    type: DaemonConstants.INVALID_REQUEST_DAEMON,
    error
  };
};

export default {
  requestDaemon,
  receiveDaemon,
  requestSaveDaemon,
  savedDaemon,
  invalidRequestDaemon
};
