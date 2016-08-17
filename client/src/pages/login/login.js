// React
import React from 'react';
import { connect } from 'react-redux';

import { SigninPane, RegisterPane, Login } from '../../components/login/login.js';

class LoginP extends React.Component {

  render() {
    return (
        <Login selected={0}>
          <RegisterPane label='Register' title='Create an account' submit='Get started' />
          <SigninPane label='Log in' title='Welcome back!' submit='Log in' />
        </Login>
    );
  }
};

// Function to map state to container props
const mapStateToLoginPageProps = (state) => {
  return {};
};

// Function to map dispatch to container props
const mapDispatchToLoginPageProps = (dispatch) => {
  return {};
};

// Redux container to Sites component
const LoginPage = connect(
  mapStateToLoginPageProps,
  mapDispatchToLoginPageProps
)(LoginP);

export default LoginPage;
