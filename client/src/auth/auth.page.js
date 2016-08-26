// React
import React from 'react';
import { connect } from 'react-redux';

import { push } from 'react-router-redux';

import Auth from './auth.component.js';
import Signin from './auth.login.component.js';
import Register from './auth.register.component.js';
import { loginUser } from './auth.thunk.js';

class LoginP extends React.Component {

  componentWillReceiveProps(nextProps) {
    if(nextProps.isAuthenticated && !nextProps.errorMessage) {
      this.props.redirect(this.props.redirectTo);
    }
  }

  componentWillMount() {
    if(this.props.isAuthenticated && !this.props.errorMessage) {
      this.props.redirect(this.props.redirectTo);
    }
  }
  render() {
    const { logUser, errorMessage, isAuthenticated } = this.props;
    return (
        <Auth selected={0}>
          <Signin label='Log in' title='Welcome back!' submit='Log in' errorMessage={errorMessage} onLoginClick={logUser}/>
          <Register label='Register' title='Create an account' submit='Get started' />
        </Auth>
    );
  }
};
LoginP.propTypes = {
  isAuthenticated: React.PropTypes.bool.isRequired,
  logUser: React.PropTypes.func.isRequired,
  redirect: React.PropTypes.func.isRequired,
  errorMessage: React.PropTypes.string,
  redirectTo : React.PropTypes.string
};

// Function to map state to container props
const mapStateToLoginPageProps = (state) => {
  const { auth } = state;
  const { isAuthenticated, errorMessage } = auth;
  const redirectTo = state.routing.locationBeforeTransitions.query.next || '/';
  return {
    isAuthenticated,
    errorMessage,
    redirectTo
  };
};

// Function to map dispatch to container props
const mapDispatchToLoginPageProps = (dispatch) => {
  return {
    logUser : (creds) => {
      dispatch(loginUser(creds));
    },
    redirect : (path) => {
      dispatch(push(path));
    }
  };
};

// Redux container to Sites component
const LoginPage = connect(
  mapStateToLoginPageProps,
  mapDispatchToLoginPageProps
)(LoginP);

export default LoginPage;
