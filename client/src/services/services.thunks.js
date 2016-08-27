// Imports for fetch API
import 'babel-polyfill';
import fetch from 'isomorphic-fetch';

import { withAuth } from '../auth/auth.wrappers.js';
import { checkHttpStatus, parseJSON, handleError } from '../utils/utils.js';

// User Actions
import {
  requestAllServices,
  receiveServices,
  invalidRequestServices
} from './services.actions.js';

// Thunk to fetch users
export function fetchServices() {
  return function (dispatch) {

    dispatch(requestAllServices());
    return fetch('/api/services', withAuth({ method:'GET' }))
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
          dispatch(receiveServices(response));
      })
      .catch(error => {
        handleError(error, invalidRequestServices, dispatch);
      });
  };
}


/********** Helper Functions **********/

// Check that if services should be fetched
function shouldFetchServices(state) {
  const services = state.services;
  if (!services || services.didInvalidate) {
    return true;
  } else if (services.isFetching) {
    return false;
  } else {
    return true;
  }
}

// Thunk to fech services only if needed
export function fetchServicesIfNeeded() {

  return (dispatch, getState) => {
    if (shouldFetchServices(getState())) {
      return dispatch(fetchServices());
    } else {
      return Promise.resolve();
    }
  };
}
