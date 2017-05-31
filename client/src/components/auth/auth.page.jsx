// React
import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { connect } from 'react-redux';

import { push } from 'react-router-redux';

import TabForm from '../common/tabform/tabform.component';
import Signin from './auth.login.component';
import Register from './auth.register.component';
import AuthThunks from '../../modules/auth/auth.thunk';

class LoginP extends React.Component {

  componentWillMount = () => {
    if(this.props.isAuthenticated && !this.props.errorMessage) {
      this.props.redirect(this.props.redirectTo);
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if(nextProps.isAuthenticated && !nextProps.errorMessage) {
      this.props.redirect(this.props.redirectTo);
    }
  }

  selectTab = () => {
    const location = this.props.location;
    if (location && location.hash === '#register') {
      return 1;
    } else {
      return 0;
    }
  }

  render = () => {
    const { logUser, regUser, onSwitch, errorMessage, isFetching } = this.props;
    return (
      <TabForm selected={this.selectTab()} onSwitch={onSwitch}>
        <Signin link='sign-in' label='Log in' title='Welcome back!'
          submit='Log in' errorMessage={errorMessage} onLoginClick={logUser} isFetching={isFetching}
        />
        <Register link='register' label='Register' title='Create an account'
          submit='Get started' errorMessage={errorMessage} onRegisterClick={regUser} isFetching={isFetching}
        />
      </TabForm>
    );
  }
};

LoginP.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  isFetching: PropTypes.bool.isRequired,
  logUser: PropTypes.func.isRequired,
  regUser : PropTypes.func.isRequired,
  onSwitch: PropTypes.func.isRequired,
  redirect: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  redirectTo : PropTypes.string,
  location: PropTypes.object
};

// Function to map state to container props
const mapStateToLoginPageProps = (state) => {
  const { auth } = state;
  const { isAuthenticated, errorMessage, isFetching } = auth;
  const query = queryString.parse(state.routing.location.search);
  const redirectTo = query.next || '/';
  return {
    isAuthenticated,
    errorMessage,
    redirectTo,
    isFetching
  };
};

// Function to map dispatch to container props
const mapDispatchToLoginPageProps = (dispatch) => {
  return {
    logUser: (creds) => {
      dispatch(AuthThunks.loginUser(creds));
    },
    redirect: (path) => {
      dispatch(push(path));
    },
    regUser: (account) => {
      dispatch(AuthThunks.registerUser(account));
    },
    onSwitch: () => {
      dispatch(AuthThunks.switchForm());
    }
  };
};

// Redux container to Sites component
const LoginPage = connect(
  mapStateToLoginPageProps,
  mapDispatchToLoginPageProps
)(LoginP);

export default LoginPage;
