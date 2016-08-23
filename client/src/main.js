import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { routerMiddleware, syncHistoryWithStore, routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';

// Reducers
import sites from './modules/sites/sites.reducer.js';
import daemons from './modules/daemons/daemons.reducer.js';
import users from './modules/users/users.reducer.js';
import toasts from './modules/toasts/toasts.reducer.js';
import modal from './modules/modal/modal.reducer.js';
import auth from './modules/auth/auth.reducer.js';

//Components
import App from './pages/app/app.js';
import Home from './pages/home/home.js';
import DaemonsPage from './pages/daemons/daemons.js';
import UsersPage from './pages/users/users.js';
import AuthPage from './pages/auth/auth.js';
import { requireAuthentication } from './components/auth/auth.isAuthenticated.js';

const loggerMiddleware = createLogger();
const rMiddleware = routerMiddleware(browserHistory);

// Add the reducer to your store on the `routing` key
const store = createStore(
  combineReducers(
    {
      sites,
      daemons,
      users,
      toasts,
      modal,
      auth,
      routing: routerReducer,
    }
  ),
  applyMiddleware(thunkMiddleware, loggerMiddleware, rMiddleware)
);

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
  <Provider store={store}>
    {/* Tell the Router to use our enhanced history */}
    <Router history={history}>
      <Route path='/' component={App}>
        <IndexRoute component={Home} />
        <Route path='/daemons' component={requireAuthentication(DaemonsPage)}/>
        <Route path='/users' component={requireAuthentication(UsersPage)} />
        <Route path='/auth' component={AuthPage} />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('root')
);
