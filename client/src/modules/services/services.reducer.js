// import constants
import { generateEntitiesReducer } from '../utils/entities';

const servicesReducer = (state, action) => {
  const reducer = generateEntitiesReducer('services');
  return reducer(state, action);
};

export default servicesReducer;
