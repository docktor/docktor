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
const daemonSaved = (daemon) => {
  return {
    type: DaemonConstants.DAEMON_SAVED,
    daemon
  };
};

// Request site deletion
const requestDeleteDaemon = (id) => {
  return {
    type: DaemonConstants.REQUEST_DELETE_DAEMON,
    id
  };
};

// Daemon is deleted
const daemonDeleted = (response) => {
  return {
    type: DaemonConstants.DAEMON_DELETED,
    id: response.id,
    receivedAt: Date.now()
  };
};


// Daemon API returns an Error
const invalidRequestDaemon = (error) => {
  return {
    type: DaemonConstants.INVALID_REQUEST_DAEMON,
    error
  };
};

// New Daemon
const newDaemon = () => {
  return {
    type: DaemonConstants.NEW_DAEMON
  };
};

export default {
  requestDaemon,
  receiveDaemon,
  requestSaveDaemon,
  daemonSaved,
  requestDeleteDaemon,
  daemonDeleted,
  invalidRequestDaemon,
  newDaemon
};
