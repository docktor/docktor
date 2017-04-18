// import constants
import ServicesConstants from './services.constants';
import { generateEntitiesActions } from '../utils/entities';

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
