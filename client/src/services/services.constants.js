import { generateEntitiesConstants } from '../utils/entities.js';

export default {
  ...generateEntitiesConstants('services'),
  CHANGE_FILTER: 'CHANGE_FILTER'
};
