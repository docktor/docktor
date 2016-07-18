import {
  INVALID_REQUEST_SITES,
  REQUEST_ALL_SITES,
  RECEIVE_SITES,
  REQUEST_DELETE_SITE,
  RECEIVE_SITE_DELETED,
  RECEIVE_SITE_SAVED
} from './sites.actions.js';

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
  action.sites.forEach(site => sites[site.ID] = site);
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
    case INVALID_REQUEST_SITES:
      return Object.assign({}, initialState);
    case REQUEST_ALL_SITES:
      return Object.assign({}, state, createRequestAllSites());
    case RECEIVE_SITES:
      return Object.assign({}, state, createReceiveSites(action));
    case REQUEST_DELETE_SITE:
      return Object.assign({}, state, createRequestDeleteSite());
    case RECEIVE_SITE_DELETED:
      let deletedSiteState = Object.assign({}, state, {
        items: { ...state.items }
      });
      delete deletedSiteState.items[action.id];
      return deletedSiteState;
    case RECEIVE_SITE_SAVED:
      let newSiteState = Object.assign({}, state, {
        items: { ...state.items }
      });
      newSiteState.items[action.site.ID] = action.site;
      return newSiteState;
    default:
      return state;
  }
};

export default sitesReducer;
