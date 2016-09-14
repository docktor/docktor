// import constants
import SitesConstants from './sites.constants.js';

const initialState = {
  isFetching: false,
  didInvalidate: true,
  items: {}
};

const createRequestAllSites = () => {
  return {
    isFetching: true,
    didInvalidate: false
  };
};

const createReceiveSites = (action) => {
  let sites = {};
  action.sites.forEach(site => sites[site.id] = site);
  return {
    isFetching: false,
    didInvalidate: false,
    items: sites,
    lastUpdated: action.receivedAt
  };
};

const createRequestDeleteSite = () => {
  return {
    isFetching: false,
    didInvalidate: false
  };
};

const sitesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SitesConstants.INVALID_REQUEST_SITES:
      return Object.assign({}, initialState);
    case SitesConstants.REQUEST_ALL_SITES:
      return Object.assign({}, state, createRequestAllSites());
    case SitesConstants.RECEIVE_SITES:
      return Object.assign({}, state, createReceiveSites(action));
    case SitesConstants.REQUEST_DELETE_SITE:
      return Object.assign({}, state, createRequestDeleteSite());
    case SitesConstants.RECEIVE_SITE_DELETED:
      let deletedSiteState = Object.assign({}, state, {
        items: { ...state.items }
      });
      delete deletedSiteState.items[action.id];
      return deletedSiteState;
    case SitesConstants.RECEIVE_SITE_SAVED:
      let newSiteState = Object.assign({}, state, {
        items: { ...state.items }
      });
      newSiteState.items[action.site.id] = action.site;
      return newSiteState;
    default:
      return state;
  }
};

export default sitesReducer;
