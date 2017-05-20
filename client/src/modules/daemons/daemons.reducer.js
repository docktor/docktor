// import constants
import DaemonsConstants from './daemons.constants';
import { generateEntitiesReducer } from '../utils/entities';

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
  const reducer = generateEntitiesReducer('daemons');
  const entitiesState = reducer(state, action);
  switch (action.type) {
    case DaemonsConstants.REQUEST_DAEMON_INFO:
      return { ...entitiesState, ...createRequestDaemonInfo(state, action) };
    case DaemonsConstants.RECEIVE_DAEMON_INFO:
      return { ...entitiesState, ...createReceiveDaemonInfo(state, action) };
    case DaemonsConstants.INVALID_REQUEST_DAEMON_INFO:
      return { ...entitiesState, ...createInvalidDaemonInfo(state, action) };
    default:
      return entitiesState;
  }
};

export default daemonsReducer;
