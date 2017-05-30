// import constants
import { generateEntitiesActions, generateEntitiesConstants } from '../utils/entities';

//=================================================
// Daemons constants
//=================================================

export const DaemonsConstants = {
  ...generateEntitiesConstants('daemons'),
  REQUEST_DAEMON_INFO: 'REQUEST_DAEMON_INFO',
  RECEIVE_DAEMON_INFO: 'RECEIVE_DAEMON_INFO',
  INVALID_REQUEST_DAEMON_INFO: 'INVALID_REQUEST_DAEMON_INFO',
};


//=================================================
// Daemons actions
//=================================================

// Request daemon info
const requestDaemonInfo = (daemon) => ({ type: DaemonsConstants.REQUEST_DAEMON_INFO, daemon });

// Daemon info are received
const receiveDaemonInfo = (daemon, info) => ({ type: DaemonsConstants.RECEIVE_DAEMON_INFO, daemon, info });

// Daemon info API returns an Error
const invalidRequestDaemonInfo = (daemon) => (error) => ({
  type: DaemonsConstants.INVALID_REQUEST_DAEMON_INFO,
  daemon,
  title: 'Cannot retreiving daemon info for ' + daemon.name,
  message: error,
  level: 'error'
});

export default {
  ...generateEntitiesActions('daemons'),
  requestDaemonInfo,
  receiveDaemonInfo,
  invalidRequestDaemonInfo
};
