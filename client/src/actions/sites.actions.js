// Imports for fetch API
import 'babel-polyfill'
import fetch from 'isomorphic-fetch'


// Request all sites
export const REQUEST_ALL_SITES = 'REQUEST_ALL_SITES'

export function requestAllSites() {
  return {
    type: REQUEST_ALL_SITES
  }
}


// Sites are received
export const RECEIVE_SITES = 'RECEIVE_SITES'

export function receiveSites(sites) {
  return {
    type: RECEIVE_SITES,
    sites,
    receivedAt: Date.now()
  }
}


// Request site deletion
export const REQUEST_DELETE_SITE = 'REQUEST_DELETE_SITE'

export function requestDeleteSite(id) {
  return {
    type: REQUEST_DELETE_SITE,
    id
  }
}


// Site is deleted
export const RECEIVE_SITE_DELETED = 'RECEIVE_SITE_DELETED'

export function receiveSiteDeleted(message) {
  return {
    type: RECEIVE_SITE_DELETED,
    message,
    receivedAt: Date.now()
  }
}

// Site API returns an Error
export const INVALID_REQUEST_SITES = 'INVALID_REQUEST_SITES'

export function invalidRequestSites(error) {
  return {
    type: INVALID_REQUEST_SITES,
    error
  }
}


// Thunk to fetch sites
export function fetchSites() {
  return function (dispatch) {

    dispatch(requestAllSites())

    return fetch(`/api/sites`)
      .then(response => {
        if (!response.ok) {
          return response.text()
        }
        return response.json()
      })
      .then(json => {
        if (typeof (json) === "string") {
          throw Error(json)
        }
        dispatch(receiveSites(json))
      })
      .catch(error => {
        dispatch(invalidRequestSites(error.message))
      })
  }
}

// Check that if sites should be fetched
function shouldFetchSites(state) {
  const sites = state.sites
  if (!sites) {
    return true
  } else if (sites.isFetching) {
    return false
  } else {
    return sites.didInvalidate
  }
}

// Thunk to fech sites only if needed
export function fetchSitesIfNeeded() {

  return (dispatch, getState) => {
    if (shouldFetchSites(getState())) {
      return dispatch(fetchSites())
    } else {
      return Promise.resolve()
    }
  }
}

// Thunk to delete a site
export function deleteSites(id) {
  return function (dispatch) {

    dispatch(requestDeleteSite(id))

    let request = new Request('/api/sites/' + id, {
      method: 'DELETE'
    });
    return fetch(request)
      .then(response => response.json())
      .then(json =>
        dispatch(receiveSiteDeleted(json))
      )
      .catch(error =>
        dispatch(invalidRequestSites(error))
      )
  }
}