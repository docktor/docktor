// React
import React from 'react';
import { connect } from 'react-redux';

import Auth from '../../components/auth/auth.js';
import Signin from '../../components/auth/auth.login.js';
import Register from '../../components/auth/auth.register.js';
import { loginUser } from '../../modules/auth/auth.thunk.js';

// HomeComponent
class HomeComponent extends React.Component {
  render() {
    const { logUser, children, isAuthenticated, errorMessage } = this.props;
    var content;
    if (isAuthenticated) {
      content = (<div></div>);
    } else {
      content = (
        <Auth selected={0}>
          <Signin label='Log in' title='Welcome back!' submit='Log in' errorMessage={errorMessage} onLoginClick={logUser}/>
          <Register label='Register' title='Create an account' submit='Get started' />
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
  children: React.PropTypes.object,
  logUser: React.PropTypes.func.isRequired,
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
    logUser : (creds) => {
      dispatch(loginUser(creds));
    }
  };
};

// Redux container to Sites component
const Home = connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeComponent);

export default Home;
