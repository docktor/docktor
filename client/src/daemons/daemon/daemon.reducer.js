import {
  INVALID_REQUEST_DAEMON,
  REQUEST_DAEMON,
  RECEIVE_DAEMON
} from './daemon.actions.js';

const initialState = {
  isFetching: false,
  didInvalidate: true,
  item: {}
};

const daemonReducer = (state = initialState, action) => {
  switch (action.type) {
    case INVALID_REQUEST_DAEMON:
      return Object.assign({}, initialState);
    case REQUEST_DAEMON:
      return Object.assign({}, state, {
        isFetching: true,
        didInvalidate: false,
        item: {}
      });
    case RECEIVE_DAEMON:
      return Object.assign({}, state, {
        isFetching: false,
        item: action.daemon
      });
    default:
      return state;
  }
};

export default daemonReducer;
