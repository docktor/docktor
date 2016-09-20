import { generateEntitiesConstants } from '../utils/entities.js';

export default {
  ...generateEntitiesConstants('groups'),
  CHANGE_FILTER: 'CHANGE_FILTER'
};
