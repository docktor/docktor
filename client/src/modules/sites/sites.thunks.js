// Imports for fetch API
import 'babel-polyfill';
import fetch from 'isomorphic-fetch';
import { withAuth } from '../auth/auth.wrappers.js';

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
    let error = false;

    return fetch('/api/sites', withAuth({ method:'GET' }))
      .then(response => {
        if (!response.ok) {
          error = true;
          return response.text();
        }
        return response.json();
      })
      .then(json => {
        if (error) {
          throw Error(json);
        }
        dispatch(receiveSites(json));
      })
      .catch(error => {
        dispatch(invalidRequestSites(error.message));
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
    let error = false;
    return fetch(request)
      .then(response => {
        if (!response.ok) {
          error = true;
        }
        return response.text();
      })
      .then(res => {
        if (error) {
          throw Error(res);
        }
        dispatch(receiveSiteDeleted(res));
      })
      .catch(error =>
        dispatch(invalidRequestSites(error))
      );
  };
}

// Thunk to save a site
export function saveSite(form) {

  let site = Object.assign({}, form);
  site.Latitude = parseFloat(site.Latitude.replace(',', '.'));
  site.Longitude = parseFloat(site.Longitude.replace(',', '.'));
  site.Created = site.Created ? site.Created : new Date();

  const id = site.ID ? site.ID : -1;

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
    let error = false;
    return fetch(request)
      .then(response => {
        if (!response.ok) {
          error = true;
          return response.text();
        }
        return response.json();
      })
      .then(res => {
        if (error) {
          throw Error(res);
        }
        dispatch(receiveSiteSaved(res));
      })
      .catch(error =>
        dispatch(invalidRequestSites(error))
      );
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
