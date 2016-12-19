import { generateEntitiesConstants } from '../utils/entities.js';

export default {
  ...generateEntitiesConstants('tags'),
  REQUEST_SAVE_TAG: 'REQUEST_SAVE_TAG',
  RECEIVE_TAG_SAVED: 'RECEIVE_TAG_SAVED'
};
