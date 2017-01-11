// import constants
import SitesConstants from './sites.constants';
import { generateEntitiesReducer } from '../utils/entities';

const createRequestSite = () => {
  return {
    isFetching: false,
    didInvalidate: false
  };
};

const sitesReducer = (state, action) => {
  const entitiesState = generateEntitiesReducer(state, action, 'sites');
  switch (action.type) {
  case SitesConstants.REQUEST_DELETE_SITE:
  case SitesConstants.REQUEST_SAVE_SITE:
    return { ...entitiesState, ...createRequestSite() };
  case SitesConstants.RECEIVE_SITE_DELETED:
    let deletedSiteState = {
      ...entitiesState,
      items: { ...entitiesState.items },
      isFetching: false
    };
    delete deletedSiteState.items[action.id];
    return deletedSiteState;
  case SitesConstants.RECEIVE_SITE_SAVED:
    let newSiteState = {
      ...entitiesState,
      items: { ...entitiesState.items },
      isFetching: false
    };
    newSiteState.items[action.site.id] = action.site;
    return newSiteState;
  default:
    return entitiesState;
  }
};

export default sitesReducer;
