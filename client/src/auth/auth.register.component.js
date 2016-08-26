// React
import React from 'react';
import classNames from 'classnames';

// Style
import './auth.component.scss';

// Register Pane containg fields to create an account
class RegisterPane extends React.Component {
  render() {
    return (
      <div id='register'>
        <h1>{this.props.title}</h1>
        <form className='ui form' >
        <div className='top-row'>
          <div className='field'>
            <label>
              First Name<span className='req'>*</span>
            </label>
            <input type='text' required placeholder='First Name' autoComplete='off' />
          </div>
          <div className='field'>
            <label>
              Last Name<span className='req'>*</span>
            </label>
            <input type='text'required placeholder='Last Name' autoComplete='off'/>
          </div>
        </div>
        <div className='top-row'>
          <div className='field'>
            <label>
              Username<span className='req'>*</span>
            </label>
            <input type='text'required placeholder='A unique username' autoComplete='off'/>
          </div>
          <div className='field'>
            <label>
              Password<span className='req'>*</span>
            </label>
            <input type='password'required placeholder='Set a password' autoComplete='off'/>
          </div>
        </div>
        <div className='field'>
          <label>
            Email Address<span className='req'>*</span>
          </label>
          <input type='email'required placeholder='A valid email address' autoComplete='off'/>
        </div>
        <button type='button' className='button button-block'>{this.props.submit}</button>
        </form>
      </div>
    );
  }
};
RegisterPane.propTypes = {
  label: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  submit: React.PropTypes.string.isRequired
};

export default RegisterPane;
