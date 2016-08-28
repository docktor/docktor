// React
import React from 'react';
import classNames from 'classnames';

// Style
import './auth.component.scss';

// Register Pane containg fields to create an account
class RegisterPane extends React.Component {

  componentDidMount() {
    $('#register > .ui.form')
      .form({
        fields: {
          username : ['empty', 'doesntContain[ ]'],
          password : ['minLength[6]', 'empty', 'doesntContain[ ]'],
          email : ['email', 'empty', 'doesntContain[ ]'],
          firstname: ['empty'],
          lastname: ['empty']
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
    const { errorMessage } = this.props;
    return (
      <div id='register'>
        <h1>{this.props.title}</h1>
        <form className='ui form' >
        <div className='top-row'>
          <div className='field'>
            <label>
              Username<span className='req'>*</span>
            </label>
            <input type='text' ref='username' name='username' placeholder='A unique username' autoComplete='off'/>
          </div>
          <div className='field'>
            <label>
              Password<span className='req'>*</span>
            </label>
            <input type='password' ref='password' name='password'  placeholder='Set a password' autoComplete='off'/>
          </div>
        </div>
        <div className='top-row'>
          <div className='field'>
            <label>
              First Name<span className='req'>*</span>
            </label>
            <input type='text' ref='firstname' name='firstname' placeholder='First Name' autoComplete='off' />
          </div>
          <div className='field'>
            <label>
              Last Name<span className='req'>*</span>
            </label>
            <input type='text' ref='lastname' name='lastname' placeholder='Last Name' autoComplete='off'/>
          </div>
        </div>
        <div className='field'>
          <label>
            Email Address<span className='req'>*</span>
          </label>
          <input type='email' ref='email' name='email' placeholder='A valid email address' autoComplete='off'/>
        </div>
        {errorMessage &&
            <p className='error'>{errorMessage}</p>
        }
        <div className='ui error message'></div>
        <button type='submit' className='button button-block'>{this.props.submit}</button>
        </form>
      </div>
    );
  }
  handleClick(event) {
      event.preventDefault();
      const username = this.refs.username;
      const password = this.refs.password;
      const email = this.refs.email;
      const firstname = this.refs.firstname;
      const lastname = this.refs.lastname;
      const account = {
        username: username.value.trim(),
        password: password.value.trim(),
        email: email.value.trim(),
        firstname: firstname.value.trim(),
        lastname: lastname.value.trim()
      };
      this.props.onRegisterClick(account);
  }
};

RegisterPane.propTypes = {
  onRegisterClick: React.PropTypes.func.isRequired,
  errorMessage: React.PropTypes.string,
  label: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  submit: React.PropTypes.string.isRequired
};

export default RegisterPane;
