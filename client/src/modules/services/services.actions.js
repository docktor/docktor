// import constants
import ServicesConstants from './services.constants.js';
import { generateEntitiesActions } from '../utils/entities.js';

// Change filter
const changeFilter = (filterValue) => {
  return {
    type: ServicesConstants.CHANGE_FILTER,
    filterValue
  };
};

export default {
  ...generateEntitiesActions('services'),
  changeFilter
};
