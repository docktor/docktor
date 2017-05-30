import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

// Reducers
import sites from './modules/sites/sites.reducer';
import daemons from './modules/daemons/daemons.reducer';
import groups from './modules/groups/groups.reducer';
import services from './modules/services/services.reducer';
import users from './modules/users/users.reducer';
import tags from './modules/tags/tags.reducer';
import toasts from './modules/toasts/toasts.reducer';
import modal from './modules/modal/modal.reducer';
import auth from './modules/auth/auth.reducer';
import exportReducer from './modules/export/export.reducer';

const reducers = combineReducers({
  sites,
  daemons,
  groups,
  services,
  users,
  tags,
  toasts,
  modal,
  auth,
  export: exportReducer,
  routing: routerReducer,
});

export default reducers;
