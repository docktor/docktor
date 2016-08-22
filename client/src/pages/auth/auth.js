// React
import React from 'react';
import { connect } from 'react-redux';

import { push } from 'react-router-redux';

import Auth from '../../components/auth/auth.js';
import Signin from '../../components/auth/auth.login.js';
import Register from '../../components/auth/auth.register.js';
import { loginUser } from '../../modules/auth/auth.thunk.js';

class LoginP extends React.Component {
  componentWillReceiveProps(nextProps) {
    if(nextProps.isAuthenticated && !nextProps.errorMessage) {
      this.props.redirect('/');
    }
  }

  componentWillMount() {
    if(this.props.isAuthenticated && !this.props.errorMessage) {
      this.props.redirect('/');
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
  errorMessage: React.PropTypes.string
};

// Function to map state to container props
const mapStateToLoginPageProps = (state) => {
  const { auth } = state;
  const { isAuthenticated, errorMessage } = auth;

  return {
    isAuthenticated,
    errorMessage
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
