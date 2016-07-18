import {
  INVALID_REQUEST_DAEMONS,
  REQUEST_ALL_DAEMONS,
  RECEIVE_DAEMONS
} from './daemons.actions.js';

const initialState = {
  isFetching: false,
  didInvalidate: true,
  items: {}
};

const createRAD = () => {
  return {
    isFetching: true,
    didInvalidate: false
  };
};

const createRD = (action) => {
  let daemons = {};
  action.daemons.forEach(daemon => daemons[daemon.ID] = daemon);
  return {
    isFetching: false,
    didInvalidate: false,
    items: daemons,
    lastUpdated: action.receivedAt
  };
};

const daemonsReducer = (state = initialState, action) => {
  switch (action.type) {
    case INVALID_REQUEST_DAEMONS:
      return Object.assign({}, initialState);
    case REQUEST_ALL_DAEMONS:
      return Object.assign({}, state, createRAD());
    case RECEIVE_DAEMONS:
      return Object.assign({}, state, createRD(action));
    default:
      return state;
  }
};

export default daemonsReducer;
