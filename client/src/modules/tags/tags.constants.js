import { generateEntitiesConstants } from '../utils/entities';

export default {
  ...generateEntitiesConstants('tags'),
  CHANGE_FILTER: 'CHANGE_FILTER_TAGS'
};
