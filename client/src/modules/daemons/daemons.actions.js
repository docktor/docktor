// import constants
import DaemonsConstants from './daemons.constants.js';
import { generateEntitiesActions } from '../utils/entities.js';

// Request daemon info
const requestDaemonInfo = (daemon) => {
  return {
    type: DaemonsConstants.REQUEST_DAEMON_INFO,
    daemon
  };
};

// Daemon info are received
const receiveDaemonInfo = (daemon, info) => {
  return {
    type: DaemonsConstants.RECEIVE_DAEMON_INFO,
    daemon,
    info
  };
};

// Daemon info API returns an Error
const invalidRequestDaemonInfo = (daemon) => {
  return function(error) {
    return {
      type: DaemonsConstants.INVALID_REQUEST_DAEMON_INFO,
      daemon,
      error
    };
  };
};

// Change filter
const changeFilter = (filterValue) => {
  return {
    type: DaemonsConstants.CHANGE_FILTER,
    filterValue
  };
};

// Request a daemons
const requestDaemon = (id) => {
  return {
    type: DaemonsConstants.REQUEST_DAEMON,
    id
  };
};

// Daemon is received
const receiveDaemon = (daemon) => {
  return {
    type: DaemonsConstants.RECEIVE_DAEMON,
    daemon
  };
};

// Request to save a daemon
const requestSaveDaemon = (daemon) => {
  return {
    type: DaemonsConstants.REQUEST_SAVE_DAEMON,
    daemon
  };
};

// Daemon is saved
const daemonSaved = (daemon) => {
  return {
    type: DaemonsConstants.DAEMON_SAVED,
    daemon
  };
};

// Request site deletion
const requestDeleteDaemon = (id) => {
  return {
    type: DaemonsConstants.REQUEST_DELETE_DAEMON,
    id
  };
};

// Daemon is deleted
const daemonDeleted = (response) => {
  return {
    type: DaemonsConstants.DAEMON_DELETED,
    id: response,
    receivedAt: Date.now()
  };
};


// Daemon API returns an Error
const invalidRequestDaemon = (error) => {
  return {
    type: DaemonsConstants.INVALID_REQUEST_DAEMON,
    error
  };
};

export default {
  ...generateEntitiesActions('daemons'),
  requestDaemonInfo,
  receiveDaemonInfo,
  invalidRequestDaemonInfo,
  changeFilter,
  requestDaemon,
  receiveDaemon,
  requestSaveDaemon,
  daemonSaved,
  requestDeleteDaemon,
  daemonDeleted,
  invalidRequestDaemon
};
