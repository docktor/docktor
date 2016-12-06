// React
import React from 'react';
import { connect } from 'react-redux';

import TabForm from '../common/tabform.component.js';
import Profile from './profile/settings.profile.component.js';
import ChangePassword from './profile/settings.password.component.js';
import UsersThunks from '../../modules/users/users.thunks.js';
import AuthTunks from '../../modules/auth/auth.thunk.js';

// Style
import './settings.page.scss';

class Settings extends React.Component {

  // Get the index of the right tab depending on the route (the anchor)
  _selectTab() {
    const location = this.props.location;
    if (location && location.hash === '#change-password') {
      return 1;
    } else {
      return 0;
    }
  }

  render() {
    const { user, isAuthenticated, isFetching, saveProfile, changePassword, deleteAccount } = this.props;
    if (isFetching) {
      return (
          <div className='ui active inverted dimmer'>
            <div className='ui text loader'>Fetching</div>
          </div>
       );
    } else if (isAuthenticated) {
      return (
      <TabForm selected={this._selectTab()}>
          <Profile
            link='profile' label='Profile' title='Edit your profile' submit='Save'
            user={user} onSave={saveProfile} onDelete={deleteAccount}
            />
          <ChangePassword
            link='change-password' label='Password' title='Change your password' submit='Change password'
            user={user} onChangePassword={changePassword}
            />
      </TabForm>
      );
    } else {
      return <div>Your are not authorized to see this page</div>;
    }
  }
};

Settings.propTypes = {
  user: React.PropTypes.object,
  isAuthenticated: React.PropTypes.bool.isRequired,
  location: React.PropTypes.object,
  saveProfile: React.PropTypes.func.isRequired,
  changePassword: React.PropTypes.func.isRequired,
  isFetching: React.PropTypes.bool.isRequired,
  deleteAccount: React.PropTypes.func.isRequired,
};

// Function to map state to container props
const mapStateToProps = (state) => {
  const { auth, routing } = state;
  const { user, isAuthenticated, isFetching } = auth;
  return { user, isAuthenticated, isFetching };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    saveProfile: (user) => {
      dispatch(UsersThunks.saveUser(user));
    },
    changePassword: (account) => {
      dispatch(AuthTunks.changePassword(account));
    },
    deleteAccount: (user) => {
      dispatch(UsersThunks.deleteUser(user));
    }
  };
};

// Redux container to settings component
const SettingsPage = connect(mapStateToProps, mapDispatchToProps)(Settings);

export default SettingsPage;
