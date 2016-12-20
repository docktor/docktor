// import constants
import TagsConstants from './tags.constants.js';
import { generateEntitiesActions } from '../utils/entities.js';

// Request save tag
const requestCreateTag = (tag) => {
  return {
    type: TagsConstants.REQUEST_CREATE_TAG,
    tag
  };
};

// Tag is saved
const receiveTagCreated = (tag) => {
  return {
    type: TagsConstants.RECEIVE_TAG_CREATED,
    tag
  };
};

const createTagInvalid = (error) => {
  return {
    type: TagsConstants.CREATE_TAG_INVALID,
    error
  };
};

// Delete tag actions

// Request delete tag
const requestDeleteTag = (tag) => {
  return {
    type: TagsConstants.REQUEST_DELETE_TAG,
    tag
  };
};

// Tag is deleted
const receiveTagDeleted = (tag) => {
  return {
    type: TagsConstants.RECEIVE_TAG_DELETED,
    tag
  };
};

const deleteTagInvalid = (tag) => {
  return function(error) {
    return {
      type: TagsConstants.DELETE_TAG_INVALID,
      tag,
      error
    };
  };
};

export default {
  ...generateEntitiesActions('tags'),
  requestCreateTag,
  receiveTagCreated,
  createTagInvalid,
  requestDeleteTag,
  receiveTagDeleted,
  deleteTagInvalid
};
