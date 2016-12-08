// React
import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';

// Style
import '../common/tabform.component.scss';

// Signin Pane containing fields to log in the application
class SigninPane extends React.Component {

  componentDidMount() {
    $('#login > .ui.form')
      .form({
        fields: {
          username : 'empty',
          password : 'empty',
        },
        onSuccess: (event, fields) => {
          this.handleClick(event);
        },
        onFailure: (event, fields) => {
          return false;
        }
      })
    ;
  }

  render() {
    const { errorMessage, isFetching } = this.props;
    return (
      <div id='login'>
        <h1>{this.props.title}</h1>
        <form className='ui form'>
          <div className='required field'>
            <label htmlFor='login-username'>
              Username
            </label>
            <input type='text' id='login-username' ref='username' name='username' autoComplete='off' placeholder='Registered/LDAP username' />
          </div>
          <div className='required field'>
              <label htmlFor='login-password'>
              Password
              </label>
              <input type='password' id='login-password' ref='password' name='password' autoComplete='off' placeholder='Password' />
          </div>
          {errorMessage &&
              <p className='error api'>{errorMessage}</p>
          }
          <div className='ui error message'></div>
          <p className='forgot'><Link to='/reset_password'>Forgot Password?</Link></p>
          <button type='submit' className={'ui button button-block submit' + (isFetching ? ' loading' : '')}>{this.props.submit}</button>
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
  submit: React.PropTypes.string.isRequired,
  isFetching: React.PropTypes.bool.isRequired,
  link: React.PropTypes.string.isRequired
};

export default SigninPane;
