// import constants
import TagsConstants from './tags.constants';
import { generateEntitiesReducer } from '../utils/entities';

const tagsReducer = (state, action) => {
  const entitiesState = generateEntitiesReducer(state, action, 'tags');
  switch (action.type) {
  case TagsConstants.CHANGE_FILTER:
    return { ...entitiesState, filterValue: action.filterValue };
  default:
    return entitiesState;
  }
};

export default tagsReducer;
