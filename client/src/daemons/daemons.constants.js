import { generateEntitiesConstants } from '../utils/entities.js';

export default {
  ...generateEntitiesConstants('daemons'),
  REQUEST_DAEMON_INFO: 'REQUEST_DAEMON_INFO',
  RECEIVE_DAEMON_INFO: 'RECEIVE_DAEMON_INFO',
  INVALID_REQUEST_DAEMON_INFO: 'INVALID_REQUEST_DAEMON_INFO',
  CHANGE_FILTER: 'CHANGE_FILTER_DAEMONS'
};
