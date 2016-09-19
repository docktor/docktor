import DaemonConstants from './daemon.constants.js';

const initialState = {
  isFetching: false,
  didInvalidate: true,
  item: {}
};

const daemonReducer = (state = initialState, action) => {
  switch (action.type) {
    case DaemonConstants.INVALID_REQUEST_DAEMON:
      return Object.assign({}, state, {
        isFetching: false,
        didInvalidate: true
      });
    case DaemonConstants.REQUEST_DAEMON:
      return Object.assign({}, state, {
        isFetching: true,
        didInvalidate: false,
        item: {}
      });
    case DaemonConstants.RECEIVE_DAEMON:
      return Object.assign({}, state, {
        isFetching: false,
        item: action.daemon
      });
    case DaemonConstants.REQUEST_SAVE_DAEMON:
      return Object.assign({}, state, {
        isFetching: true,
        didInvalidate: false
      });
    case DaemonConstants.DAEMON_SAVED:
      let newDaemonState = Object.assign({}, state, {
        isFetching: false,
        didInvalidate: false,
        item : action.daemon
      });
      return newDaemonState;
    default:
      return state;
  }
};

export default daemonReducer;
