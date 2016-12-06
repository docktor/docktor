import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { routerMiddleware, syncHistoryWithStore, routerReducer } from 'react-router-redux';

// Reducers
import sites from './modules/sites/sites.reducer.js';
import daemons from './modules/daemons/daemons.reducer.js';
import daemon from './modules/daemons/daemon/daemon.reducer.js';
import groups from './modules/groups/groups.reducer.js';
import services from './modules/services/services.reducer.js';
import users from './modules/users/users.reducer.js';
import toasts from './modules/toasts/toasts.reducer.js';
import modal from './modules/modal/modal.reducer.js';
import auth from './modules/auth/auth.reducer.js';
import exportReducer from './modules/export/export.reducer.js';

//Components
import App from './components/app/app.layout.js';
import Home from './components/app/home.page.js';
import DaemonsPage from './components/daemons/daemons.page.js';
import DaemonPage from './components/daemons/daemon/daemon.page.js';
import GroupsPage from './components/groups/groups.page.js';
import ServicesPage from './components/services/services.page.js';

import SettingsPage from './components/settings/settings.page.js';
import UsersPage from './components/users/users.page.js';
import AuthPage from './components/auth/auth.page.js';
import ChangeResetPasswordPage from './components/auth/auth.change-reset-password.page.js';
import ResetPasswordPage from './components/auth/auth.reset-password.page.js';
import { requireAuthorization } from './components/auth/auth.isAuthorized.js';

// thunks
import AuthThunks from './modules/auth/auth.thunk.js';

// Constants
import { AUTH_ADMIN_ROLE, AUTH_SUPERVISOR_ROLE } from './modules/auth/auth.constants.js';

const loggerMiddleware = createLogger();
const rMiddleware = routerMiddleware(browserHistory);

// Add the reducer to your store on the `routing` key
const store = createStore(
  combineReducers(
    {
      sites,
      daemons,
      daemon,
      groups,
      services,
      users,
      toasts,
      modal,
      auth,
      export: exportReducer,
      routing: routerReducer,
    }
  ),
  applyMiddleware(thunkMiddleware, loggerMiddleware, rMiddleware)
);

const authToken = localStorage.getItem('id_token');
if (authToken) {
  store.dispatch(AuthThunks.profile());
}

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
  <Provider store={store}>
    {/* Tell the Router to use our enhanced history */}
    <Router history={history}>
      <Route path='/' component={App}>
        <IndexRoute component={Home} />
        <Route path='daemons'>
          <IndexRoute component={requireAuthorization(DaemonsPage, [AUTH_ADMIN_ROLE, AUTH_SUPERVISOR_ROLE])}/>
          <Route path='new' component={requireAuthorization(DaemonPage, [AUTH_ADMIN_ROLE])}/>
          <Route path=':id' component={requireAuthorization(DaemonPage, [AUTH_ADMIN_ROLE, AUTH_SUPERVISOR_ROLE])}/>
        </Route>
        <Route path='groups' component={requireAuthorization(GroupsPage)}/>
        <Route path='services' component={requireAuthorization(ServicesPage)} />
        <Route path='users' component={requireAuthorization(UsersPage)} />
        <Route path='settings' component={requireAuthorization(SettingsPage)} />
        <Route path='login' component={AuthPage} />
        <Route path='change_reset_password' component={ChangeResetPasswordPage} />
        <Route path='reset_password' component={ResetPasswordPage} />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('root')
);
