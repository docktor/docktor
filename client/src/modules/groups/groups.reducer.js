// import constants
import GroupsConstants from './groups.constants';
import { generateEntitiesReducer } from '../utils/entities';

const groupsReducer = (state, action) => {
  const entitiesState = generateEntitiesReducer(state, action, 'groups');
  switch (action.type) {
  case GroupsConstants.CHANGE_FILTER:
    return { ...entitiesState, filterValue: action.filterValue };
  default:
    return entitiesState;
  }
};

export default groupsReducer;
