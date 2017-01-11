import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { routerMiddleware, syncHistoryWithStore, routerReducer } from 'react-router-redux';

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

// Components
import App from './components/app/app.layout';
import Home from './components/app/home.page';
import DaemonsPage from './components/daemons/daemons.page';
import DaemonPage from './components/daemons/daemon/daemon.page';
import GroupsPage from './components/groups/groups.page';
import GroupEditPage from './components/groups/group/group.edit.page';
import GroupViewPage from './components/groups/group/group.view.page';
import ServicesPage from './components/services/services.page';
import ServicePage from './components/services/service/service.page';
import SettingsPage from './components/settings/settings.page';
import UsersPage from './components/users/users.page';
import UserPage from './components/users/user/user.page';
import TagsPage from './components/tags/tags.page';
import AuthPage from './components/auth/auth.page';
import ChangeResetPasswordPage from './components/auth/auth.change-reset-password.page';
import ResetPasswordPage from './components/auth/auth.reset-password.page';
import { requireAuthorization } from './components/auth/auth.isAuthorized';

// Thunks
import AuthThunks from './modules/auth/auth.thunk';

// Constants
import { AUTH_ADMIN_ROLE, AUTH_SUPERVISOR_ROLE } from './modules/auth/auth.constants';

const loggerMiddleware = createLogger();
const rMiddleware = routerMiddleware(browserHistory);

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
          <IndexRoute component={requireAuthorization(DaemonsPage, [AUTH_ADMIN_ROLE, AUTH_SUPERVISOR_ROLE])} />
          <Route path='new' component={requireAuthorization(DaemonPage, [AUTH_ADMIN_ROLE])} />
          <Route path=':id' component={requireAuthorization(DaemonPage, [AUTH_ADMIN_ROLE, AUTH_SUPERVISOR_ROLE])} />
        </Route>
        <Route path='groups'>
          <IndexRoute component={requireAuthorization(GroupsPage)} />
          <Route path='new' component={requireAuthorization(GroupEditPage, [AUTH_ADMIN_ROLE])} />
          <Route path=':id'>
            <IndexRoute component={requireAuthorization(GroupViewPage)} />
            <Route path='view' component={requireAuthorization(GroupViewPage)} />
            <Route path='edit' component={requireAuthorization(GroupEditPage, [AUTH_ADMIN_ROLE])} />
          </Route>
        </Route>
        <Route path='services'>
          <IndexRoute component={requireAuthorization(ServicesPage)} />
          <Route path='new' component={requireAuthorization(ServicePage, [AUTH_ADMIN_ROLE])} />
          <Route path=':id' component={requireAuthorization(ServicePage, [AUTH_ADMIN_ROLE])} />
        </Route>
        <Route path='users'>
          <IndexRoute component={requireAuthorization(UsersPage)} />
          <Route path=':id' component={requireAuthorization(UserPage, [AUTH_ADMIN_ROLE])} />
        </Route>
        <Route path='tags' component={requireAuthorization(TagsPage, [AUTH_ADMIN_ROLE])} />
        <Route path='settings' component={requireAuthorization(SettingsPage)} />
        <Route path='login' component={AuthPage} />
        <Route path='change_reset_password' component={ChangeResetPasswordPage} />
        <Route path='reset_password' component={ResetPasswordPage} />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('root')
);
