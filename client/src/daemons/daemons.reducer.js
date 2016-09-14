// import constants
import DaemonsConstants from './daemons.constants.js';

const initialState = {
  isFetching: false,
  didInvalidate: true,
  items: {}
};

const createRequestAllDaemons = () => {
  return {
    isFetching: true,
    didInvalidate: false
  };
};

const createReceiveDaemon = (state, action) => {
  let daemons = {};
  action.daemons.forEach(daemon => daemons[daemon.id] = Object.assign({}, state.items[daemon.id], daemon));
  return {
    isFetching: false,
    didInvalidate: false,
    items: daemons,
    lastUpdated: action.receivedAt
  };
};

const createRequestDaemonInfo  = (state, action) => {
  let newItems = state.items;
  if (action.daemon.id) {
    let newItem = { ...newItems[action.daemon.id] };
    newItem.isFetching = true;
    newItems[action.daemon.id] = newItem;
  }
  return {
    items: newItems
  };
};

const createReceiveDaemonInfo = (state, action) => {
  let newItems = state.items;
  action.daemon.isFetching = false;
  action.daemon.info = action.info;
  if (action.daemon.id) {
    newItems[action.daemon.id] = action.daemon;
  }
  return {
    items: newItems
  };
};

const createInvalidDaemonInfo = (state, action) => {
  let newItems = state.items;
  if (action.daemon.id) {
    let newItem = { ...newItems[action.daemon.id] };
    newItem.isFetching = false;
    newItem.info = { status: 'DOWN' };
    newItems[action.daemon.id] = newItem;
  }
  return {
    items: newItems
  };
};

const daemonsReducer = (state = initialState, action) => {
  switch (action.type) {
    case DaemonsConstants.INVALID_REQUEST_DAEMONS:
      return Object.assign({}, initialState);
    case DaemonsConstants.REQUEST_ALL_DAEMONS:
      return Object.assign({}, state, createRequestAllDaemons());
    case DaemonsConstants.RECEIVE_DAEMONS:
      return Object.assign({}, state, createReceiveDaemon(state, action));
    case DaemonsConstants.REQUEST_DAEMON_INFO:
      return Object.assign({}, state, createRequestDaemonInfo(state, action));
    case DaemonsConstants.RECEIVE_DAEMON_INFO:
      return Object.assign({}, state, createReceiveDaemonInfo(state, action));
    case DaemonsConstants.INVALID_REQUEST_DAEMON_INFO:
      return Object.assign({}, state, createInvalidDaemonInfo(state, action));
    default:
      return state;
  }
};

export default daemonsReducer;
