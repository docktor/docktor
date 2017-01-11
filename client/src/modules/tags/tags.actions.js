// import constants
import TagsConstants from './tags.constants';
import { generateEntitiesActions } from '../utils/entities';

// Change filter
const changeFilter = (filterValue) => {
  return {
    type: TagsConstants.CHANGE_FILTER,
    filterValue
  };
};

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

// Save tag actions

// Request saving tag
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

// Problem during saving
const saveTagInvalid = (tag) => {
  return function(error) {
    return {
      type: TagsConstants.SAVE_TAG_INVALID,
      tag,
      error
    };
  };
};

export default {
  ...generateEntitiesActions('tags'),
  changeFilter,
  requestCreateTag,
  receiveTagCreated,
  createTagInvalid,
  requestDeleteTag,
  receiveTagDeleted,
  deleteTagInvalid,
  requestSaveTag,
  receiveTagSaved,
  saveTagInvalid
};
