// import constants
import ServicesConstants from './services.constants.js';
import { generateEntitiesReducer } from '../utils/entities.js';

const servicesReducer = (state, action) => {
  const entitiesState = generateEntitiesReducer(state, action, 'services');
  switch (action.type) {
  case ServicesConstants.CHANGE_FILTER:
    return { ...entitiesState, filterValue: action.filterValue };
  case ServicesConstants.INVALID_REQUEST_SERVICE:
    return {
      ...entitiesState,
      selected : {
        ...entitiesState.selected,
        isFetching: false,
        didInvalidate: true,
        id: ''
      }
    };
  case ServicesConstants.REQUEST_SERVICE:
    return {
      ...entitiesState,
      selected : {
        ...entitiesState.selected,
        isFetching: true,
        didInvalidate: false,
        id: action.id
      }
    };
  case ServicesConstants.RECEIVE_SERVICE:
    const newReceivedService = action.service;
    const oldServiceReceived = entitiesState.items[newReceivedService.id];
    return {
      ...entitiesState,
      items: {
        ...entitiesState.items,
        [newReceivedService.id]: { ...oldServiceReceived, ...newReceivedService }
      },
      selected: {
        ...entitiesState.selected,
        isFetching: false
      }
    };
  case ServicesConstants.REQUEST_SAVE_SERVICE:
    return {
      ...entitiesState,
      selected: {
        ...entitiesState.selected,
        isFetching: true,
        didInvalidate: false
      }
    };
  case ServicesConstants.SERVICE_SAVED:
    const newSavedService = action.service;
    const oldServiceSaved = entitiesState.items[newSavedService.id];
    let newServiceState = {
      ...entitiesState,
      items: {
        ...entitiesState.items,
        [newSavedService.id]: { ...oldServiceSaved, ...newSavedService }
      },
      selected : {
        ...entitiesState.selected,
        isFetching: false,
        didInvalidate: false,
        id: ''
      }
    };
    return newServiceState;
  case ServicesConstants.SERVICE_DELETED:
    let deletedServiceState = {
      ...entitiesState,
      items: { ...entitiesState.items },
      selected : {
        isFetching: false,
        didInvalidate: true,
        id : ''
      }
    };
    delete deletedServiceState.items[action.id];
    return deletedServiceState;
  default:
    return entitiesState;
  }
};

export default servicesReducer;
