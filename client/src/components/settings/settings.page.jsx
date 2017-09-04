// React
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import TabForm from '../common/tabform/tabform.component';
import Profile from './profile/settings.profile.component';
import Details from './profile/settings.details.component';
import ChangePassword from './profile/settings.password.component';
import UsersThunks from '../../modules/users/users.thunks';
import AuthTunks from '../../modules/auth/auth.thunk';
import ToastsActions from '../../modules/toasts/toasts.actions';

// Style
import './settings.page.scss';

class Settings extends React.Component {

  // Get the index of the right tab depending on the route (the anchor)
  selectTab = () => {
    const location = this.props.location;
    if (location && location.hash === '#change-password') {
      return 2;
    } else if (location && location.hash === '#details') {
      return 1;
    } else {
      return 0;
    }
  }

  render = () => {
    const { user, isAuthenticated, isFetching, saveProfile, changePassword, deleteAccount } = this.props;
    if (isFetching) {
      return (
        <div className='ui active inverted dimmer'>
          <div className='ui text loader'>Fetching</div>
        </div>
      );
    } else if (isAuthenticated) {
      return (
        <TabForm selected={this.selectTab()}>
          <Profile
            link='profile' label='Profile' title='Edit your profile' submit='Save'
            user={user} onSave={saveProfile} onDelete={deleteAccount}
          />
          <Details
            link='details' label='Details' title='View your details'
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
  user: PropTypes.object,
  isAuthenticated: PropTypes.bool.isRequired,
  location: PropTypes.object,
  saveProfile: PropTypes.func.isRequired,
  changePassword: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  deleteAccount: PropTypes.func.isRequired,
};

// Function to map state to container props
const mapStateToProps = (state) => {
  const { auth } = state;
  const { user, isAuthenticated, isFetching } = auth;
  return { user, isAuthenticated, isFetching };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    saveProfile: (user) => {
      dispatch(UsersThunks.save(user, null, ToastsActions.confirmSave(`User "${user.displayName}"`)));
    },
    changePassword: (account) => {
      dispatch(AuthTunks.changePassword(account));
    },
    deleteAccount: (user) => {
      dispatch(UsersThunks.delete(user));
    }
  };
};

// Redux container to settings component
const SettingsPage = connect(mapStateToProps, mapDispatchToProps)(Settings);

export default SettingsPage;
