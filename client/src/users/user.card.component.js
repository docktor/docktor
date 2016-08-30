// React
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { AUTH_ADMIN_ROLE, AUTH_USER_ROLE, getRoleLabel } from '../auth/auth.constants.js';
import {  saveUser } from './users.thunks.js';

// Style
import './user.card.component.scss';

// UserCard Component
class UserCardComponent extends React.Component {

    onChangeRole() {
      const oldUser = this.props.user;
      const userToSave = Object.assign({}, oldUser, { Role: (oldUser.Role === AUTH_ADMIN_ROLE ? AUTH_USER_ROLE :  AUTH_ADMIN_ROLE) });
      this.props.saveUserProp(userToSave);
    }

    render() {
      const getRoleClass = (user, connectedUser) => {
        let classes = 'tiny compact ui toggle button ';
        if (connectedUser.role !== AUTH_ADMIN_ROLE) {
          classes += 'disabled ';
        }
        if (user.isFetching) {
          classes += 'loading';
        } else if (user.Role === AUTH_ADMIN_ROLE) {
          classes += 'active';
        }
        return classes;
      };
      const user = this.props.user;
      const connectedUser = this.props.auth.user;
        return (
          <div className='ui card user'>
            <div className='content'>
              <img className='ui avatar image' src='/images/avatar.jpg'/>{user.DisplayName}
              <span className='right floated meta'>
                <button onClick={() => this.onChangeRole()} className={getRoleClass(user, connectedUser)} >
                  <i className={user.Role === AUTH_ADMIN_ROLE ? 'unlock icon' : 'lock icon'}></i>
                  {getRoleLabel(user.Role)}
                </button>
              </span>
            </div>
            <div className='extra content'>
              <span className='right floated'>
                <i className='travel icon'></i>
                {user.Groups.length + ' group(s)'}
              </span>
              <div className='email' title={user.Email}>
              <i className='mail icon'></i>{user.Email}
              </div>
            </div>
          </div>
        );
    }
}
UserCardComponent.propTypes = {
   user: React.PropTypes.object,
   auth: React.PropTypes.object,
   saveUserProp: React.PropTypes.func.isRequired
};

// Function to map state to container props
const mapStateToProps = (state) => {
  return {
      auth: state.auth,
  };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    saveUserProp: (user) => {
      dispatch(saveUser(user));
    }
  };
};

// Redux container to Sites component
const UserCard = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserCardComponent);

export default UserCard;
