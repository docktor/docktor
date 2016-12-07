// import constants
import GroupsConstants from './groups.constants.js';
import { generateEntitiesActions } from '../utils/entities.js';

// Change filter
const changeFilter = (filterValue) => {
  return {
    type: GroupsConstants.CHANGE_FILTER,
    filterValue
  };
};

export default {
  ...generateEntitiesActions('groups'),
  changeFilter
};
