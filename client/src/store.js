import { createStore, combineReducers, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import { browserHistory } from 'react-router';
import { routerMiddleware, routerReducer } from 'react-router-redux';


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
import { composeWithDevTools } from 'redux-devtools-extension';

// Thunks
import AuthThunks from './modules/auth/auth.thunk';

// Configure middlewares
const rMiddleware = routerMiddleware(browserHistory);
let defaultMiddlewares = [ thunkMiddleware, rMiddleware ];
let middlewares;
if (process.env.NODE_ENV !== 'production') {
  // Dev dependencies
  const loggerMiddleware = createLogger();
  defaultMiddlewares = [ ...defaultMiddlewares, loggerMiddleware ];
  middlewares = composeWithDevTools(applyMiddleware(...defaultMiddlewares));
} else {
  middlewares =  applyMiddleware(...defaultMiddlewares);
}

// Add the reducer to your store on the `routing` key
const store = createStore(
  combineReducers(
    {
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
    }
  ),
  middlewares
);

const authToken = localStorage.getItem('id_token');
if (authToken) {
  store.dispatch(AuthThunks.profile());
}

export default store;
