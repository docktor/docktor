// import constants
import SitesConstants from './sites.constants.js';
import { generateEntitiesReducer } from '../utils/entities.js';

const createRequestDeleteSite = () => {
  return {
    isFetching: false,
    didInvalidate: false
  };
};

const sitesReducer = (state, action) => {
  const entitiesState = generateEntitiesReducer(state, action, 'sites');
  switch (action.type) {
    case SitesConstants.REQUEST_DELETE_SITE:
      return Object.assign({}, entitiesState, createRequestDeleteSite());
    case SitesConstants.RECEIVE_SITE_DELETED:
      let deletedSiteState = Object.assign({}, entitiesState, {
        items: { ...entitiesState.items }
      });
      delete deletedSiteState.items[action.id];
      return deletedSiteState;
    case SitesConstants.RECEIVE_SITE_SAVED:
      let newSiteState = Object.assign({}, entitiesState, {
        items: { ...entitiesState.items }
      });
      newSiteState.items[action.site.id] = action.site;
      return newSiteState;
    default:
      return entitiesState;
  }
};

export default sitesReducer;
