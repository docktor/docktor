// import constants
import DaemonsConstants from './daemons.constants.js';
import { generateEntitiesReducer } from '../utils/entities.js';

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

const daemonsReducer = (state, action) => {
  const entitiesState = generateEntitiesReducer(state, action, 'daemons');
  switch (action.type) {
  case DaemonsConstants.REQUEST_DAEMON_INFO:
    return { ...entitiesState, ...createRequestDaemonInfo(state, action) };
  case DaemonsConstants.RECEIVE_DAEMON_INFO:
    return { ...entitiesState, ...createReceiveDaemonInfo(state, action) };
  case DaemonsConstants.INVALID_REQUEST_DAEMON_INFO:
    return { ...entitiesState, ...createInvalidDaemonInfo(state, action) };
  case DaemonsConstants.CHANGE_FILTER:
    return { ...entitiesState, filterValue: action.filterValue };
  case DaemonsConstants.INVALID_REQUEST_DAEMON:
    return {
      ...entitiesState,
      selected : {
        ...entitiesState.selected,
        isFetching: false,
        didInvalidate: true,
        id: ''
      }
    };
  case DaemonsConstants.REQUEST_DAEMON:
    return {
      ...entitiesState,
      selected : {
        ...entitiesState.selected,
        isFetching: true,
        didInvalidate: false,
        id: action.id
      }
    };
  case DaemonsConstants.RECEIVE_DAEMON:
    const newReceivedDaemon = action.daemon;
    const oldDaemonReceived = entitiesState.items[newReceivedDaemon.id];
    return {
      ...entitiesState,
      items: {
        ...entitiesState.items,
        [newReceivedDaemon.id]: { ...oldDaemonReceived, ...newReceivedDaemon }
      },
      selected: {
        ...entitiesState.selected,
        isFetching: false
      }
    };
  case DaemonsConstants.REQUEST_SAVE_DAEMON:
    return {
      ...entitiesState,
      selected: {
        ...entitiesState.selected,
        isFetching: true,
        didInvalidate: false
      }
    };
  case DaemonsConstants.DAEMON_SAVED:
    const newSavedDaemon = action.daemon;
    const oldDaemonSaved = entitiesState.items[newSavedDaemon.id];
    let newDaemonState = {
      ...entitiesState,
      items: {
        ...entitiesState.items,
        [newSavedDaemon.id]: { ...oldDaemonSaved, ...newSavedDaemon }
      },
      selected : {
        ...entitiesState.selected,
        isFetching: false,
        didInvalidate: false,
        id: newSavedDaemon.id
      }
    };
    return newDaemonState;
  case DaemonsConstants.DAEMON_DELETED:
    let deletedDaemonState = {
      ...entitiesState,
      items: { ...entitiesState.items },
      selected : {
        isFetching: false,
        didInvalidate: true,
        id : ''
      }
    };
    delete deletedDaemonState.items[action.id];
    return deletedDaemonState;
  default:
    return entitiesState;
  }
};

export default daemonsReducer;
