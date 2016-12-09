// React
import React from 'react';
import classNames from 'classnames';

import UserConstants from '../../../modules/users/users.constants.js';

// Style
import '../../common/tabform/tabform.component.scss';

// ChangePasswordPane containg fields to change password
class ChangePasswordPane extends React.Component {

  _isDisabled(user) {
    return user.provider !== UserConstants.USER_LOCAL_PROVIDER;
  }

  componentDidMount() {
    $('#change-password > .ui.form')
      .form({
        fields: {
          oldPassword: ['empty'],
          newPassword : ['minLength[6]', 'empty', 'doesntContain[ ]']
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
    const { user } = this.props;
    return (
      <div id='change-password'>
        <h1>{this.props.title}</h1>
         <form className='ui form' >
            <div className='required field'>
              <label>
                Old password
              </label>
              <input
              type='password' ref='oldPassword' defaultValue=''
              name='oldPassword' placeholder='Your old password' autoComplete='off'
              disabled={this._isDisabled(user) ? 'true' : ''}
              />
            </div>
          <div className='required field'>
            <label>
              New password
            </label>
            <input type='password' ref='newPassword'  defaultValue=''
            name='newPassword' placeholder='Your new password' autoComplete='off'
            disabled={this._isDisabled(user) ? 'true' : ''}
            />
          </div>
          {!user.isFetching && user.passwordErrorMessage &&
              <p className='error api'>{user.passwordErrorMessage}</p>
          }
          {this._isDisabled(user) &&
              <p className='info api'>You can't change your password here because your user comes from a LDAP provider</p>
          }
          <div className='ui error message'></div>
          <button type='submit' className={'ui button button-block submit' + (user.isFetching ? ' loading' : '')} disabled={this._isDisabled(user) ? 'true' : ''}>{this.props.submit}</button>
        </form>
      </div>
    );
  }
  handleClick(event) {
    event.preventDefault();
    const oldPassword = this.refs.oldPassword;
    const newPassword = this.refs.newPassword;
    const account = {
      id: this.props.user.id,
      oldPassword: oldPassword.value.trim(),
      newPassword: newPassword.value.trim()
    };
    this.props.onChangePassword(account);
  }
};

ChangePasswordPane.propTypes = {
  onChangePassword: React.PropTypes.func,
  label: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  submit: React.PropTypes.string,
  link: React.PropTypes.string.isRequired,
  user: React.PropTypes.object.isRequired
};

export default ChangePasswordPane;
