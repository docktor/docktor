// React
import React from 'react';
import { connect } from 'react-redux';

import Auth from '../auth/auth.component.js';
import Signin from '../auth/auth.login.component.js';
import Register from '../auth/auth.register.component.js';
import AuthThunks from '../auth/auth.thunk.js';

// HomeComponent displaying either the register/login component or information about Docktor when authenticated
class HomeComponent extends React.Component {
  render() {
    const { logUser, regUser, onSwitch, isAuthenticated, errorMessage, isFetching } = this.props;
    var content;
    if (isAuthenticated) {
      content = (<div></div>);
    } else {
      content = (
        <Auth selected={0} onSwitch={onSwitch}>
          <Signin label='Log in' title='Welcome back!' submit='Log in' errorMessage={errorMessage} onLoginClick={logUser} isFetching={isFetching}/>
          <Register label='Register' title='Create an account' submit='Get started' errorMessage={errorMessage} onRegisterClick={regUser} isFetching={isFetching} />
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
  isFetching : React.PropTypes.bool.isRequired,
  logUser: React.PropTypes.func.isRequired,
  regUser : React.PropTypes.func.isRequired,
  onSwitch : React.PropTypes.func.isRequired,
  errorMessage: React.PropTypes.string
};

// Function to map state to container props
const mapStateToProps = (state) => {
  const { auth } = state;
  const { isAuthenticated, errorMessage, isFetching } = auth;

  return {
    isAuthenticated,
    errorMessage,
    isFetching
  };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    logUser: (creds) => {
      dispatch(AuthThunks.loginUser(creds));
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
const Home = connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeComponent);

export default Home;
