// import constants
import { generateEntitiesReducer } from '../utils/entities';

const groupsReducer = (state, action) => {
  const reducer = generateEntitiesReducer('groups');
  return reducer(state, action);
};

export default groupsReducer;
