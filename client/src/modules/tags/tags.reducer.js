// import constants
import TagsConstants from './tags.constants.js';
import { generateEntitiesReducer } from '../utils/entities.js';

const tagsReducer = (state, action) => {
  const entitiesState = generateEntitiesReducer(state, action, 'tags');
  switch (action.type) {
  default:
    return entitiesState;
  }
};

export default tagsReducer;
