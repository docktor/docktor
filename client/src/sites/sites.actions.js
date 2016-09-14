// import constants
import SitesConstants from './sites.constants.js';

// Request all sites
export function requestAllSites() {
  return {
    type: SitesConstants.REQUEST_ALL_SITES
  };
}

// Sites are received
export function receiveSites(sites) {
  return {
    type: SitesConstants.RECEIVE_SITES,
    sites,
    receivedAt: Date.now()
  };
}

// Request site deletion
export function requestDeleteSite(id) {
  return {
    type: SitesConstants.REQUEST_DELETE_SITE,
    id
  };
}

// Site is deleted
export function receiveSiteDeleted(response) {
  return {
    type: SitesConstants.RECEIVE_SITE_DELETED,
    id: response.id,
    receivedAt: Date.now()
  };
}

// Request save site
export function requestSaveSite(site) {
  return {
    type: SitesConstants.REQUEST_SAVE_SITE,
    site
  };
}

// Site is saved
export function receiveSiteSaved(site) {
  return {
    type: SitesConstants.RECEIVE_SITE_SAVED,
    site
  };
}

// Site API returns an Error
export function invalidRequestSites(error) {
  return {
    type: SitesConstants.INVALID_REQUEST_SITES,
    error
  };
}
