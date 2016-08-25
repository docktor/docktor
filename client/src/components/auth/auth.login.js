// React
import React from 'react';
import classNames from 'classnames';

// Style
import './auth.scss';

// Signin Pane containing fields to log in the application
class SigninPane extends React.Component {
  render() {
    const { errorMessage } = this.props;
    return (
      <div id='login'>
        <h1>{this.props.title}</h1>
        <form className='ui form' onSubmit={(event) => this.handleClick(event)}>
          <div className='field'>
            <label>
              Username<span className='req'>*</span>
            </label>
            <input type='text' ref='username' required autoComplete='off' placeholder='Registered/LDAP username' />
          </div>
          <div className='field'>
              <label>
              Password<span className='req'>*</span>
              </label>
              <input type='password' ref='password' required autoComplete='off' placeholder='Password' />
          </div>
          <p className='forgot'><a href='#'>Forgot Password?</a></p>
          <button type='submit' className='button button-block'>{this.props.submit}</button>
          {errorMessage &&
              <p>{errorMessage}</p>
          }
        </form>
      </div>
    );
  }

  handleClick(event) {
      event.preventDefault();
      const username = this.refs.username;
      const password = this.refs.password;
      const creds = { username: username.value.trim(), password: password.value.trim() };
      this.props.onLoginClick(creds);
  }
};

SigninPane.propTypes = {
  onLoginClick: React.PropTypes.func.isRequired,
  errorMessage: React.PropTypes.string,
  label: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  submit: React.PropTypes.string.isRequired
};

export default SigninPane;
