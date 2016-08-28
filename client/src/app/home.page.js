// React
import React from 'react';
import { connect } from 'react-redux';

import Auth from '../auth/auth.component.js';
import Signin from '../auth/auth.login.component.js';
import Register from '../auth/auth.register.component.js';
import { loginUser, registerUser, switchForm } from '../auth/auth.thunk.js';

// HomeComponent displaying either the register/login component or information about Docktor when authenticated
class HomeComponent extends React.Component {
  render() {
    const { logUser, regUser, onSwitch, isAuthenticated, errorMessage } = this.props;
    var content;
    if (isAuthenticated) {
      content = (<div></div>);
    } else {
      content = (
        <Auth selected={0} onSwitch={onSwitch}>
          <Signin label='Log in' title='Welcome back!' submit='Log in' errorMessage={errorMessage} onLoginClick={logUser}/>
          <Register label='Register' title='Create an account' submit='Get started' errorMessage={errorMessage} onRegisterClick={regUser} />
        </Auth>
      );
    }
    return (
      content
    );
  }
}
HomeComponent.propTypes = {
  isAuthenticated : React.PropTypes.bool.isRequired,
  logUser: React.PropTypes.func.isRequired,
  regUser : React.PropTypes.func.isRequired,
  onSwitch : React.PropTypes.func.isRequired,
  errorMessage: React.PropTypes.string
};

// Function to map state to container props
const mapStateToProps = (state) => {
  const { auth } = state;
  const { isAuthenticated, errorMessage } = auth;

  return {
    isAuthenticated,
    errorMessage
  };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    logUser: (creds) => {
      dispatch(loginUser(creds));
    },
    regUser: (account) => {
      dispatch(registerUser(account));
    },
    onSwitch: () => {
      dispatch(switchForm());
    }
  };
};

// Redux container to Sites component
const Home = connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeComponent);

export default Home;
