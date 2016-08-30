// Imports for fetch API
import 'babel-polyfill';
import fetch from 'isomorphic-fetch';
import { withAuth } from '../auth/auth.wrappers.js';
import { checkHttpStatus, parseJSON, handleError } from '../utils/utils.js';

// Site Actions
import {
  requestAllSites,
  receiveSites,
  invalidRequestSites,
  requestDeleteSite,
  receiveSiteDeleted,
  requestSaveSite,
  receiveSiteSaved
} from './sites.actions.js';

/********** Thunk Functions **********/

// Thunk to fetch sites
export function fetchSites() {
  return function (dispatch) {

    dispatch(requestAllSites());
    return fetch('/api/sites', withAuth({ method:'GET' }))
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
          dispatch(receiveSites(response));
      })
      .catch(error => {
        handleError(error, invalidRequestSites, dispatch);
      });
  };
}

// Thunk to delete a site
export function deleteSite(id) {
  return function (dispatch) {

    dispatch(requestDeleteSite(id));

    let request = new Request('/api/sites/' + id, withAuth({
      method: 'DELETE'
    }));
    return fetch(request)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
          dispatch(receiveSiteDeleted(response));
      })
      .catch(error => {
          handleError(error, invalidRequestSites, dispatch);
      });
  };
}

// Thunk to save a site
export function saveSite(form) {

  let site = Object.assign({}, form);
  site.latitude = parseFloat(site.latitude.replace(',', '.'));
  site.longitude = parseFloat(site.longitude.replace(',', '.'));
  site.created = site.created ? site.created : new Date();

  const id = site.id ? site.id : -1;

  return function (dispatch) {

    dispatch(requestSaveSite(site));

    let request = new Request('/api/sites/' + id, withAuth({
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(site)
    }));
    return fetch(request)
    .then(checkHttpStatus)
    .then(parseJSON)
    .then(response => {
        dispatch(receiveSiteSaved(response));
    })
    .catch(error => {
        handleError(error, invalidRequestSites, dispatch);
    });
  };
}


/********** Helper Functions **********/

// Check that if sites should be fetched
function shouldFetchSites(state) {
  const sites = state.sites;
  if (!sites || sites.didInvalidate) {
    return true;
  } else if (sites.isFetching) {
    return false;
  } else {
    return true;
  }
}

// Thunk to fech sites only if needed
export function fetchSitesIfNeeded() {

  return (dispatch, getState) => {
    if (shouldFetchSites(getState())) {
      return dispatch(fetchSites());
    } else {
      return Promise.resolve();
    }
  };
}
