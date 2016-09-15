// Imports for fetch API
import 'babel-polyfill';
import fetch from 'isomorphic-fetch';
import { withAuth } from '../auth/auth.wrappers.js';
import { checkHttpStatus, parseJSON, handleError } from '../utils/utils.js';

// Daemons Actions
import * as DaemonsActions from './daemons.actions.js';

/********** Thunk Functions **********/

// Thunk to fetch daemons
export function fetchDaemons() {
  return function (dispatch) {

    dispatch(DaemonsActions.requestAllDaemons());

    return fetch('/api/daemons', withAuth({ method:'GET' }))
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(DaemonsActions.receiveDaemons(response));
      })
      .catch(error => {
        handleError(error, DaemonsActions.invalidRequestDaemons, dispatch);
      });
  };
}

// Thunk to fetch daemon info
export function fetchDaemonInfo(daemon, force) {
  return function (dispatch) {

    dispatch(DaemonsActions.requestDaemonInfo(daemon));
    let url = `/api/daemons/${daemon.id}/info`;
    url = force ? url + '?force=true' : url;
    return fetch(url, withAuth({ method:'GET' }))
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(DaemonsActions.receiveDaemonInfo(daemon, response));
      })
      .catch(error => {
        handleError(error, DaemonsActions.invalidRequestDaemonInfo(daemon), dispatch);
      });
  };
}


/********** Helper Functions **********/

// Check that if daemons should be fetched
function shouldFetchDaemons(state) {
  const daemons = state.daemons;
  if (!daemons || daemons.didInvalidate) {
    return true;
  } else if (daemons.isFetching) {
    return false;
  } else {
    return true;
  }
}

// Thunk to fech daemons only if needed
export function fetchDaemonsIfNeeded() {

  return (dispatch, getState) => {
    if (shouldFetchDaemons(getState())) {
      return dispatch(fetchDaemons());
    } else {
      return Promise.resolve();
    }
  };
}
