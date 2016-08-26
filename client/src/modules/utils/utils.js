
import { loginError } from '../auth/auth.actions.js';
import { push } from 'react-router-redux';

export const checkHttpStatus = response => {
    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error;
    }
};

export const parseJSON = response => {
     return response.json();
};

export const dispatchError = (status, message, action, dispatchFunc) => {
  if(status === 401) {
    // When JWT Token expired or is invalid, redirect to auth
    dispatchFunc(loginError(message));
    dispatchFunc(push('/auth'));
  } else {
    dispatchFunc(action);
  }
};
