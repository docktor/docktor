// Imports for fetch API
import 'babel-polyfill';
import fetch from 'isomorphic-fetch';


// Request all sites
export const REQUEST_ALL_SITES = 'REQUEST_ALL_SITES';

export function requestAllSites() {
  return {
    type: REQUEST_ALL_SITES
  };
}


// Sites are received
export const RECEIVE_SITES = 'RECEIVE_SITES';

export function receiveSites(sites) {
  return {
    type: RECEIVE_SITES,
    sites,
    receivedAt: Date.now()
  };
}

// Request site deletion
export const REQUEST_DELETE_SITE = 'REQUEST_DELETE_SITE';

export function requestDeleteSite(id) {
  return {
    type: REQUEST_DELETE_SITE,
    id
  };
}

// Site is deleted
export const RECEIVE_SITE_DELETED = 'RECEIVE_SITE_DELETED';

export function receiveSiteDeleted(id) {
  return {
    type: RECEIVE_SITE_DELETED,
    id,
    receivedAt: Date.now()
  };
}

// Request save site
export const REQUEST_SAVE_SITE = 'REQUEST_SAVE_SITE';

export function requestSaveSite(site) {
  return {
    type: REQUEST_SAVE_SITE,
    site
  };
}

// Site is saved
export const RECEIVE_SITE_SAVED = 'RECEIVE_SITE_SAVED';

export function receiveSiteSaved(site) {
  return {
    type: RECEIVE_SITE_SAVED,
    site
  };
}

// Site API returns an Error
export const INVALID_REQUEST_SITES = 'INVALID_REQUEST_SITES';

export function invalidRequestSites(error) {
  return {
    type: INVALID_REQUEST_SITES,
    error
  };
}
