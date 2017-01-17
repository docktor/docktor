// import constants
import ServicesConstants from './services.constants';
import { generateEntitiesReducer } from '../utils/entities';

const servicesReducer = (state, action) => {
  const entitiesState = generateEntitiesReducer(state, action, 'services');
  switch (action.type) {
  case ServicesConstants.CHANGE_FILTER:
    return { ...entitiesState, filterValue: action.filterValue };
  default:
    return entitiesState;
  }
};

export default servicesReducer;
