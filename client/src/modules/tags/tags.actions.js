// import constants
import TagsConstants from './tags.constants.js';
import { generateEntitiesActions } from '../utils/entities.js';

// Request save tag
const requestSaveTag = (tag) => {
  return {
    type: TagsConstants.REQUEST_SAVE_TAG,
    tag
  };
};

// Tag is saved
const receiveTagSaved = (tag) => {
  return {
    type: TagsConstants.RECEIVE_TAG_SAVED,
    tag
  };
};

export default {
  ...generateEntitiesActions('tags'),
  requestSaveTag,
  receiveTagSaved
};
