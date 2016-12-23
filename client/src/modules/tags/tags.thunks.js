// Imports for fetch API
import { generateEntitiesThunks } from '../utils/entities.js';
import fetch from 'isomorphic-fetch';
import { withAuth } from '../auth/auth.wrappers.js';
import { checkHttpStatus, parseJSON, handleError } from '../utils/promises.js';

// Tags Actions
import TagsActions from './tags.actions.js';

// Thunk to save a tag
const createTag = (form) => {

  let tag = Object.assign({}, form);
  tag.name = { raw: tag.name };
  tag.category = { raw: tag.category };
  tag.usageRights = tag.rights;

  return function (dispatch) {

    dispatch(TagsActions.requestCreateTag(tag));

    let request = new Request('/api/tags', withAuth({
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tag)
    }));
    return fetch(request)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(TagsActions.receiveTagCreated(response));
      })
      .catch(error => {
        handleError(error, TagsActions.createTagInvalid, dispatch);
      });
  };
};

// Thunk to save tag
const saveTag = (form) => {

  let tag = Object.assign({}, form);
  tag.name = { raw: tag.name };
  tag.category = { raw: tag.category };
  tag.usageRights = tag.rights;

  return function (dispatch) {

    dispatch(TagsActions.requestSaveTag(tag));

    let request = new Request(`/api/tags/${tag.id}`, withAuth({
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tag)
    }));
    return fetch(request)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(TagsActions.receiveTagSaved(response));
      })
      .catch(error => {
        handleError(error, TagsActions.saveTagInvalid(tag), dispatch);
      });
  };
};

// Thunk to save a tag
const deleteTag = (tag) => {

  return function (dispatch) {

    dispatch(TagsActions.requestDeleteTag(tag));

    let request = new Request(`/api/tags/${tag.id}`, withAuth({
      method: 'DELETE',
    }));
    return fetch(request)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(TagsActions.receiveTagDeleted(response));
      })
      .catch(error => {
        handleError(error, TagsActions.deleteTagInvalid(tag), dispatch);
      });
  };
};

export default {
  ...generateEntitiesThunks('tags'),
  createTag,
  saveTag,
  deleteTag
};
