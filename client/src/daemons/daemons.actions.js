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

export default {
  ...generateEntitiesActions('daemons'),
  requestDaemonInfo,
  receiveDaemonInfo,
  invalidRequestDaemonInfo,
  changeFilter
};
