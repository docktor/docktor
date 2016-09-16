// import constants
import GroupsConstants from './groups.constants.js';
import { generateEntitiesReducer } from '../utils/entities.js';

const groupsReducer = (state, action) => {
  const entitiesState = generateEntitiesReducer(state, action, 'groups');
  switch (action.type) {
    default:
      return entitiesState;
  }
};

export default groupsReducer;
