// React
import React from 'react';
import { connect } from 'react-redux';

import { push } from 'react-router-redux';

import TabForm from '../common/tabform/tabform.component.js';
import Signin from './auth.login.component.js';
import Register from './auth.register.component.js';
import AuthThunks from '../../modules/auth/auth.thunk.js';

class LoginP extends React.Component {

  _selectTab() {
    const location = this.props.location;
    if (location && location.hash === '#register') {
      return 1;
    } else {
      return 0;
    }
  }

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
    const { logUser, regUser, onSwitch, errorMessage, isAuthenticated, isFetching } = this.props;
    return (
        <TabForm selected={this._selectTab()} onSwitch={onSwitch}>
          <Signin link='sign-in' label='Log in' title='Welcome back!' submit='Log in' errorMessage={errorMessage} onLoginClick={logUser} isFetching={isFetching}/>
          <Register link='register' label='Register' title='Create an account' submit='Get started' errorMessage={errorMessage} onRegisterClick={regUser} isFetching={isFetching}/>
        </TabForm>
    );
  }
};
LoginP.propTypes = {
  isAuthenticated: React.PropTypes.bool.isRequired,
  isFetching: React.PropTypes.bool.isRequired,
  logUser: React.PropTypes.func.isRequired,
  regUser : React.PropTypes.func.isRequired,
  onSwitch: React.PropTypes.func.isRequired,
  redirect: React.PropTypes.func.isRequired,
  errorMessage: React.PropTypes.string,
  redirectTo : React.PropTypes.string,
  location: React.PropTypes.object
};

// Function to map state to container props
const mapStateToLoginPageProps = (state) => {
  const { auth } = state;
  const { isAuthenticated, errorMessage, isFetching } = auth;
  const redirectTo = state.routing.locationBeforeTransitions.query.next || '/';
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
