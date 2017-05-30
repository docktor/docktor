import { generateEntitiesReducer } from '../utils/entities';

const sitesReducer = (state, action) => {
  const reducer = generateEntitiesReducer('sites');
  return reducer(state, action);
};

export default sitesReducer;
