// Imports for fetch API
import { generateEntitiesThunks } from '../utils/entities';
import fetch from 'isomorphic-fetch';
import { withAuth } from '../auth/auth.wrappers';
import { checkHttpStatus, parseJSON, handleError } from '../utils/promises';

// Tags Actions
import TagsActions from './tags.actions';

// Thunk to create new category containing tags
const createTags = (form) => {

  let tags = form.tags.map(tag =>{
    return {
      'name': { 'raw' : tag },
      'category': { 'raw' : form.category },
      'usageRights' : form.rights
    };
  });

  return function (dispatch) {

    const createTag = (tag) => {
      dispatch(TagsActions.requestSave(tag));

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
        dispatch(TagsActions.saved(response));
      })
      .catch(error => {
        handleError(error, TagsActions.invalidSaveEntity(tag), dispatch);
      });
    };

    return Promise.all(
      tags.map(tag => createTag(tag))
    );

  };
};

export default {
  ...generateEntitiesThunks('tags'),
  createTags
};
