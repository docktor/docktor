// React
import React from 'react';
import classNames from 'classnames';

// Style
import './../common/tabform.component.scss';

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
    const { errorMessage, isFetching } = this.props;
    return (
      <div id='register'>
        <h1>{this.props.title}</h1>
        <form className='ui form' >
          <div className='top-row'>
            <div className='required field'>
              <label>
                Username
              </label>
              <input type='text' ref='username' name='username' placeholder='A unique username' autoComplete='off'/>
            </div>
            <div className='required field'>
              <label>
                Password
              </label>
              <input type='password' ref='password' name='password'  placeholder='Set a password' autoComplete='off'/>
            </div>
          </div>
          <div className='top-row'>
            <div className='required field'>
              <label>
                First Name
              </label>
              <input type='text' ref='firstname' name='firstname' placeholder='First Name' autoComplete='off' />
            </div>
            <div className='required field'>
              <label>
                Last Name
              </label>
              <input type='text' ref='lastname' name='lastname' placeholder='Last Name' autoComplete='off'/>
            </div>
          </div>
          <div className='required field'>
            <label>
              Email Address
            </label>
            <input type='email' ref='email' name='email' placeholder='A valid email address' autoComplete='off'/>
          </div>
          {errorMessage &&
              <p className='error api'>{errorMessage}</p>
          }
          <div className='ui error message'></div>
          <button type='submit' className={'ui button button-block submit' + (isFetching ? ' loading' : '')}>{this.props.submit}</button>
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
  submit: React.PropTypes.string.isRequired,
  isFetching: React.PropTypes.bool.isRequired,
  link: React.PropTypes.string.isRequired
};

export default RegisterPane;
