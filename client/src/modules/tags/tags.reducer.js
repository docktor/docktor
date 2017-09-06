// import constants
import { generateEntitiesReducer } from '../utils/entities';

const tagsReducer = (state, action) => {
  const reducer = generateEntitiesReducer('tags');
  return reducer(state, action);
};

export default tagsReducer;
