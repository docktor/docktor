// import constants
import UsersConstants from './users.constants';
import { generateEntitiesActions } from '../utils/entities';


// Change filter
const changeFilter = (filterValue) => {
  return {
    type: UsersConstants.CHANGE_FILTER,
    filterValue
  };
};

export default {
  ...generateEntitiesActions('users'),
  changeFilter
};
