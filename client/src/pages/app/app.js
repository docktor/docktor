// React
import React from 'react';
import { connect } from 'react-redux';

// Components
import NavBar from '../../components/navBar/navBar.js';
import Footer from '../../components/footer/footer.js';
import Toasts from '../../components/toasts/toasts.js';
import Modal from '../../components/modal/modal.js';
import Auth from '../../components/auth/auth.js';
import Signin from '../../components/auth/auth.login.js';
import Register from '../../components/auth/auth.register.js';
import { loginUser } from '../../modules/auth/auth.thunk.js';

// JS dependancies
import 'jquery';
import form from 'semantic/dist/semantic.js';
$.form = form;

// Style
import 'semantic/dist/semantic.css';
import './app.scss';
import './flex.scss';

// App Component
class AppComponent extends React.Component {
  render() {
    const { logUser, children, isAuthenticated, errorMessage } = this.props;
    var content;
    if (isAuthenticated) {
      content = <div className='flex main layout vertical'>{children}</div>;
    } else {
      content = (
        <Auth selected={0}>
          <Signin label='Log in' title='Welcome back!' submit='Log in' errorMessage={errorMessage} onLoginClick={logUser}/>
          <Register label='Register' title='Create an account' submit='Get started' />
        </Auth>
      );
    }
    return (
      <div className='layout vertical start-justified fill'>
        <NavBar />
          {content}
         <Toasts />
        <Modal />
      </div>
    );
  }
}
AppComponent.propTypes = {
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
const App = connect(
  mapStateToProps,
  mapDispatchToProps
)(AppComponent);

export default App;
