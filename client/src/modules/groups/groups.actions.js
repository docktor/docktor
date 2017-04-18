// import constants
import GroupsConstants from './groups.constants';
import { generateEntitiesActions } from '../utils/entities';

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
