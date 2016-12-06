import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { routerMiddleware, syncHistoryWithStore, routerReducer } from 'react-router-redux';

// Reducers
import sites from './sites/sites.reducer.js';
import daemons from './daemons/daemons.reducer.js';
import daemon from './daemons/daemon/daemon.reducer.js';
import groups from './groups/groups.reducer.js';
import services from './services/services.reducer.js';
import users from './users/users.reducer.js';
import toasts from './toasts/toasts.reducer.js';
import modal from './modal/modal.reducer.js';
import auth from './auth/auth.reducer.js';
import exportReducer from './export/export.reducer.js';

//Components
import App from './app/app.layout.js';
import Home from './app/home.page.js';
import DaemonsPage from './daemons/daemons.page.js';
import DaemonPage from './daemons/daemon/daemon.page.js';
import GroupsPage from './groups/groups.page.js';
import ServicesPage from './services/services.page.js';
import SettingsPage from './settings/settings.page.js';
import UsersPage from './users/users.page.js';
import AuthPage from './auth/auth.page.js';
import ChangeResetPasswordPage from './auth/auth.change-reset-password.page.js';
import ResetPasswordPage from './auth/auth.reset-password.page.js';
import { requireAuthorization } from './auth/auth.isAuthorized.js';

// thunks
import AuthThunks from './auth/auth.thunk.js';

// Constants
import { AUTH_ADMIN_ROLE, AUTH_SUPERVISOR_ROLE } from './auth/auth.constants.js';

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
        <Route path='services' component={requireAuthorization(ServicesPage)}/>
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
