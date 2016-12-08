// React
import React from 'react';
import classNames from 'classnames';

import Rodal from 'rodal';

import UserConstants from '../../../modules/users/users.constants.js';


// Style
import '../../common/tabform.component.scss';

// ProfilePane containg fields to edit an existing account
class ProfilePane extends React.Component {

  constructor(props) {
    super(props);
    this.state = { isRemovalModalVisible: false };
  }

  _isDisabled(user) {
    return user.provider !== UserConstants.USER_LOCAL_PROVIDER;
  }

  _removeAccount() {
    this.setState({ isRemovalModalVisible: true });
  }

  _closeRemoveAccountModal() {
    this.setState({ isRemovalModalVisible: false });
  }

  _validateRemoval() {
    this.props.onDelete(this.props.user);
    this._closeRemoveAccountModal();
  }

  componentDidMount() {
    $('#profile > .ui.form')
      .form({
        fields: {
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
    const { user } = this.props;
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
          <div className={'ui red labeled icon button button-block' + (user.isDeleting ? ' loading' : '')} tabIndex='0' onClick={() => this._removeAccount()}>
            <i className='trash icon'></i>Remove your account
          </div>
          {!user.isFetching && user.errorMessage &&
              <p className='error api'>{user.errorMessage}</p>
          }
          <div className='ui error message'></div>
          {this._isDisabled(user) &&
              <p className='info api'>You can't edit your personal data because it's own by a LDAP provider</p>
          }
          <button
            type='submit' className={'ui button button-block submit' + (user.isFetching ? ' loading' : '')}
            disabled={this._isDisabled(user) ? 'true' : ''}>{this.props.submit}
          </button>
        </form>
        <Rodal visible={this.state.isRemovalModalVisible}
            onClose={() => this._closeRemoveAccountModal()}>
            <div className='ui active small modal'>
                <i className='close circle icon' onClick={() =>this._closeRemoveAccountModal()}></i>
                <div className='header'><i className='large trash icon'></i> Remove your account</div>
                <div className='content'>
                    <h2>Are you sure to delete your account ?</h2>
                    <p>This action is irreversible and you will lose all your data</p>
                </div>
                <div className='actions'>
                    <div className='ui black button' onClick={() => this._closeRemoveAccountModal()}>
                        No
                    </div>
                    <div className='ui teal right labeled icon button' onClick={() => this._validateRemoval()}>
                        Yes
                        <i className='trash icon'></i>
                    </div>
                </div>
            </div>
        </Rodal>
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
    this.props.onSave(userToSave);
  }
};

ProfilePane.propTypes = {
  onSave: React.PropTypes.func,
  onDelete: React.PropTypes.func.isRequired,
  label: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  submit: React.PropTypes.string,
  user: React.PropTypes.object.isRequired,
  link: React.PropTypes.string.isRequired
};

export default ProfilePane;
