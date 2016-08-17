// React
import React from 'react';
import classNames from 'classnames';

// Style
import './login.scss';

// Signin Pane containing fields to log in the application
export class SigninPane extends React.Component {
  render() {
    return (
      <div id='login'>
        <h1>{this.props.title}</h1>
        <form className='ui form'>
          <div className='field'>
            <label>
              Username<span className='req'>*</span>
            </label>
            <input type='text'required autoComplete='off' placeholder='Registered/LDAP username'/>
          </div>
          <div className='field'>
              <label>
              Password<span className='req'>*</span>
              </label>
              <input type='password'required autoComplete='off' placeholder='Password'/>
          </div>
          <p className='forgot'><a href='#'>Forgot Password?</a></p>
          <button type='submit' className='ui button button-block'>{this.props.submit}</button>
        </form>
      </div>
    );
  }
};

SigninPane.propTypes = {
  label: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  submit: React.PropTypes.string.isRequired
};

// Register Pane containg fields to create an account

export class RegisterPane extends React.Component {
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
        <button type='submit' className='button button-block'>{this.props.submit}</button>
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

// Login tab containing signin and register panes
export class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: this.props.selected
    };
  }
  _handleClick(index) {
    this.setState({
      selected: index
    });
  }
  _renderTitles() {
    function labels(child, index) {
      let liClasses = classNames({
        'tab': true,
        'active' : this.state.selected === index
      });
      return (
        <li key={index} className={liClasses}>
          <a href='#' onClick={() => this._handleClick(index)}>{child.props.label}</a>
        </li>
      );
    }
    return (
      <ul className='tab-group'>
        {this.props.children.map(labels.bind(this))}
      </ul>
    );
  }
  _renderContent() {
    return (
      <div className='tab-content'>
        {this.props.children[this.state.selected]}
      </div>
    );
  }
  render() {
    return (
      <div className='login-form login'>
        {this._renderTitles()}
        {this._renderContent()}
      </div>
    );
  }
};
Login.propTypes = {
  selected: React.PropTypes.number,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.element
  ]).isRequired
};
Login.defaultProps = {
  selected: 0
};
