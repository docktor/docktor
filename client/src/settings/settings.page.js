// React
import React from 'react';
import { connect } from 'react-redux';

import TabForm from '../common/tabform.component.js';
import Profile from './settings.profile.component.js';
import ChangePassword from './settings.password.component.js';
import UsersThunks from '../users/users.thunks.js';

// Style
import './settings.component.scss';

class SettingsP extends React.Component {

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
    const { user, isAuthenticated, errorMessage, isFetching, saveProfile } = this.props;
    if (isFetching) {
      return <div>Loading...</div>;
    } else if (isAuthenticated) {
      return (
      <TabForm selected={this._selectTab()} /*onSwitch={onSwitch}*/>
          <Profile link='profile' label='Profile' title='Edit your profile' submit='Save' user={user} errorMessage={errorMessage} onSaveEditClick={saveProfile}/>
          <ChangePassword link='change-password' label='Password' title='Change your password' submit='Save' /*errorMessage={errorMessage}*/ /*onSaveEditlick={saveUser}*/ /*isFetching={isFetching}*//>
      </TabForm>
      );
    } else {
      return <div>Your are not authorized to see this page</div>;
    }
  }
};

SettingsP.propTypes = {
  user: React.PropTypes.object,
  isAuthenticated: React.PropTypes.bool.isRequired,
  errorMessage: React.PropTypes.string,
  location: React.PropTypes.object,
  saveProfile: React.PropTypes.func.isRequired,
  isFetching: React.PropTypes.bool.isRequired
};

// Function to map state to container props
const mapStateToProps = (state) => {
  const { auth, routing } = state;
  const { user, isAuthenticated, isFetching } = auth;
  const errorMessage = '';
  return { user, isAuthenticated, isFetching, errorMessage };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    saveProfile: (user) => {
      dispatch(UsersThunks.saveUser(user));
    },
  };
};

// Redux container to settings component
const SettingsPage = connect(mapStateToProps, mapDispatchToProps)(SettingsP);

export default SettingsPage;
