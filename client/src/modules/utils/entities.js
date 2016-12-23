// Imports for fetch API
import 'babel-polyfill';
import fetch from 'isomorphic-fetch';
import { withAuth } from '../auth/auth.wrappers.js';
import { checkHttpStatus, parseJSON, handleError } from '../utils/promises.js';

const getConsts = (entitiesName) => {
  const NAME = entitiesName.toUpperCase();
  const CONST_REQUEST = 'REQUEST_' + NAME;
  const CONST_RECEIVE = 'RECEIVE_' + NAME;
  const CONST_INVALID = 'INVALID_REQUEST_' + NAME;
  return {
    CONST_REQUEST,
    CONST_RECEIVE,
    CONST_INVALID
  };
};

export const generateEntitiesConstants = (entitiesName) => {
  const { CONST_REQUEST, CONST_RECEIVE, CONST_INVALID } = getConsts(entitiesName);
  const constants = {};
  constants[CONST_REQUEST] = CONST_REQUEST;
  constants[CONST_RECEIVE] = CONST_RECEIVE;
  constants[CONST_INVALID] = CONST_INVALID;
  return constants;
};

export const generateEntitiesActions = (entitiesName) => {
  const { CONST_REQUEST, CONST_RECEIVE, CONST_INVALID } = getConsts(entitiesName);
  return {
    requestAll: () => {
      return { type: CONST_REQUEST };
    },
    received: (items) => {
      return {
        type: CONST_RECEIVE,
        items,
        receivedAt: Date.now()
      };
    },
    invalidRequest: (error) => {
      return { type: CONST_INVALID, error };
    }
  };
};

export const generateEntitiesReducer = (state = initialState, action, entitiesName) => {
  const { CONST_REQUEST, CONST_RECEIVE, CONST_INVALID } = getConsts(entitiesName);
  switch (action.type) {
  case CONST_INVALID:
    return Object.assign({}, state, initialState);
  case CONST_REQUEST:
    return Object.assign({}, state, createRequest());
  case CONST_RECEIVE:
    return Object.assign({}, state, createReceive(state, action));
  default:
    return state;
  }
};

const initialState = {
  isFetching: false,
  didInvalidate: true,
  items: {}
};

const createRequest = () => {
  return {
    isFetching: true,
    didInvalidate: false
  };
};

const createReceive = (state, action) => {
  let items = {};
  action.items.forEach(item => items[item.id] = Object.assign({}, state.items[item.id], item));
  return {
    isFetching: false,
    didInvalidate: false,
    items: items,
    lastUpdated: action.receivedAt
  };
};

// Check that if entities should be fetched
const shouldFetch = (state, entitiesName) => {
  const entities = state[entitiesName.toLowerCase()];
  if (!entities || entities.didInvalidate) {
    return true;
  } else if (entities.isFetching) {
    return false;
  } else {
    return true;
  }
};

// Thunk to fech only if needed
const fetchIfNeeded = (entitiesName, fetchFunc) => {
  return (dispatch, getState) => {
    if (shouldFetch(getState(), entitiesName)) {
      return dispatch(fetchFunc());
    } else {
      return Promise.resolve();
    }
  };
};

export const generateEntitiesThunks = (entitiesName) => {
  const Actions = generateEntitiesActions(entitiesName);
  const fetchFunc = () => {
    return (dispatch) => {
      dispatch(Actions.requestAll());

      return fetch(`/api/${entitiesName}`, withAuth({ method:'GET' }))
        .then(checkHttpStatus)
        .then(parseJSON)
        .then(response => {
          dispatch(Actions.received(response));
        })
        .catch(error => {
          handleError(error, Actions.invalidRequest, dispatch);
        });
    };
  };
  return {
    fetch: fetchFunc,
    fetchIfNeeded: () => fetchIfNeeded(entitiesName, fetchFunc)
  };
};
