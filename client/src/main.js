import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Route } from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';

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

// Constants
import { AUTH_ADMIN_ROLE, AUTH_SUPERVISOR_ROLE } from './modules/auth/auth.actions';

import { store, history } from './store';

ReactDOM.render(
  <Provider store={store}>
    {/* Tell the Router to use our enhanced history */}
    <ConnectedRouter history={history}>
      <App>
        <Route exact path='/' component={Home} />
        <Route exact path='/daemons' component={requireAuthorization(DaemonsPage, [AUTH_ADMIN_ROLE, AUTH_SUPERVISOR_ROLE])} />
        <Route exact path='/daemons/new' component={requireAuthorization(DaemonPage, [AUTH_ADMIN_ROLE])} />
        <Route exact path='/daemons/:id' component={requireAuthorization(DaemonPage, [AUTH_ADMIN_ROLE, AUTH_SUPERVISOR_ROLE])} />
        <Route exact path='/groups' component={requireAuthorization(GroupsPage)} />
        <Route exact path='/groups/new' component={requireAuthorization(GroupEditPage, [AUTH_ADMIN_ROLE])} />
        <Route exact path='/groups/:id' component={requireAuthorization(GroupViewPage)} />
        <Route exact path='/groups/:id/view' component={requireAuthorization(GroupViewPage)} />
        <Route exact path='/groups/:id/edit' component={requireAuthorization(GroupEditPage, [AUTH_ADMIN_ROLE])} />
        <Route exact path='/services' component={requireAuthorization(ServicesPage)} />
        <Route exact path='/services/new' component={requireAuthorization(ServicePage, [AUTH_ADMIN_ROLE])} />
        <Route exact path='/services/:id' component={requireAuthorization(ServicePage, [AUTH_ADMIN_ROLE])} />
        <Route exact path='/users' component={requireAuthorization(UsersPage)} />
        <Route exact path='/users/:id' component={requireAuthorization(UserPage, [AUTH_ADMIN_ROLE])} />
        <Route exact path='/tags' component={requireAuthorization(TagsPage, [AUTH_ADMIN_ROLE])} />
        <Route exact path='/settings' component={requireAuthorization(SettingsPage)} />
        <Route exact path='/login' component={AuthPage} />
        <Route exact path='/change_reset_password' component={ChangeResetPasswordPage} />
        <Route exact path='/reset_password' component={ResetPasswordPage} />
      </App>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);
