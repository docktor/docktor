import 'babel-polyfill'
import fetch from 'isomorphic-fetch'

export const REQUEST_SITES = 'REQUEST_SITES'

export function requestSites() {
  return {
    type: REQUEST_SITES
  }
}

export const RECEIVE_SITES = 'RECEIVE_SITES'

export function receiveSites(sites) {
  return {
    type: RECEIVE_SITES,
    sites,
    receivedAt: Date.now()
  }
}

export const REQUEST_DELETE_SITE = 'REQUEST_DELETE_SITE'

export function requestDeleteSite(id) {
  return {
    type: REQUEST_DELETE_SITE,
    id
  }
}

export const RECEIVE_SITE_DELETED = 'RECEIVE_SITE_DELETED'

export function receiveSiteDeleted(message) {
  return {
    type: RECEIVE_SITE_DELETED,
    message,
    receivedAt: Date.now()
  }
}

export const INVALID_REQUEST_SITES = 'INVALID_REQUEST_SITES'

export function invalidRequestSites(error) {
  return {
    type: INVALID_REQUEST_SITES,
    error
  }
}

export function fetchSites() {
  return function (dispatch) {
    
    dispatch(requestSites())

    return fetch(`/api/sites`)
      .then(response => response.json())
      .then(json => 
        dispatch(receiveSites(json))
      )
      .catch(error => 
        dispatch(invalidRequestSites(error))
      )
  }
}

export function deleteSites(id) {
  return function (dispatch) {
    
    dispatch(requestDeleteSite(id))
    
    let request = new Request('/api/sites/'+id, {
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

export function fetchSitesIfNeeded() {

  return (dispatch, getState) => {
    if (shouldFetchSites(getState())) {
      return dispatch(fetchSites())
    } else {
      return Promise.resolve()
    }
  }
}