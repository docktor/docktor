// React
import React from 'react';
import classNames from 'classnames';

import { USER_LDAP_PROVIDER } from '../users/users.constants.js';

// Style
import '../common/tabform.component.scss';

// ProfilePane containg fields to edit an existing account
class ProfilePane extends React.Component {

  _isDisabled(user) {
    return user.provider === USER_LDAP_PROVIDER;
  }

  componentDidMount() {
    $('#profile > .ui.form')
      .form({
        fields: {
          username : ['empty', 'doesntContain[ ]'],
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
    const { errorMessage, user } = this.props;
    return (
      <div id='profile'>
        <h1>{this.props.title}</h1>
         <form className='ui form' >
            <div className='required field'>
              <label>
                Username
              </label>
              <input type='text' defaultValue={user.username} placeholder='A unique username' autoComplete='off' disabled/>
            </div>
          <div className='top-row'>
            <div className='required field'>
              <label>
                First Name
              </label>
              <input type='text' ref='firstname' name='firstname' defaultValue={user.firstName}
              placeholder='First Name' autoComplete='off'
              disabled={this._isDisabled(user) ? 'true' : ''} />
            </div>
            <div className='required field'>
              <label>
                Last Name
              </label>
              <input type='text' ref='lastname' name='lastname' defaultValue={user.lastName}
              placeholder='Last Name' autoComplete='off'
              disabled={this._isDisabled(user) ? 'true' : ''}/>
            </div>
          </div>
          <div className='required field'>
            <label>
              Email Address
            </label>
            <input type='email' ref='email' name='email' defaultValue={user.email}
            placeholder='A valid email address' autoComplete='off'
            disabled={this._isDisabled(user) ? 'true' : ''}/>
          </div>
          {errorMessage &&
              <p className='error api'>{errorMessage}</p>
          }
          {this._isDisabled(user) &&
              <p className='info api'>You can't edit your personal data because it's own by a LDAP provider</p>
          }
          <button
            type='submit' className={'ui button button-block' + (user.isFetching ? ' loading' : '')}
            disabled={this._isDisabled(user) ? 'true' : ''}>{this.props.submit}
          </button>
        </form>
      </div>
    );
  }
  handleClick(event) {
      event.preventDefault();
      const email = this.refs.email;
      const firstname = this.refs.firstname;
      const lastname = this.refs.lastname;
      const account = {
        email: email.value.trim(),
        firstname: firstname.value.trim(),
        lastname: lastname.value.trim(),
        displayName: firstname.value.trim() + ' ' + lastname.value.trim()
      };
      // Override user with values defined by authenticated person
      const userToSave = Object.assign({}, this.props.user, account);
      this.props.onSaveEditClick(userToSave);
  }
};

ProfilePane.propTypes = {
  onSaveEditClick: React.PropTypes.func,
  errorMessage: React.PropTypes.string,
  label: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  submit: React.PropTypes.string,
  user: React.PropTypes.object.isRequired,
  link: React.PropTypes.string.isRequired
};

export default ProfilePane;
