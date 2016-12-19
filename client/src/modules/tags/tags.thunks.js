// Imports for fetch API
import { generateEntitiesThunks } from '../utils/entities.js';
import fetch from 'isomorphic-fetch';
import { withAuth } from '../auth/auth.wrappers.js';
import { checkHttpStatus, parseJSON, handleError } from '../utils/promises.js';

// Tags Actions
import TagsActions from './tags.actions.js';

// Thunk to save a tag
const saveTag = (form) => {

  let tag = Object.assign({}, form);
  tag.name = { raw: tag.name };
  tag.category = { raw: tag.category };
  tag.usageRights = tag.rights;

  return function (dispatch) {

    dispatch(TagsActions.requestSaveTag(tag));

    const id = tag.id ? tag.id : '-1';

    let request = new Request(`/api/tags/${id}`, withAuth({
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
        handleError(error, TagsActions.invalidRequestTags, dispatch);
      });
  };
};

export default {
  ...generateEntitiesThunks('tags'),
  saveTag
};
