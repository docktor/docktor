// React
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Card, Icon, Image, Dropdown, Button, Label } from 'semantic-ui-react';
import classNames from 'classnames';

import { AUTH_ADMIN_ROLE, AUTH_SUPERVISOR_ROLE, ALL_ROLES, getRoleLabel, getRoleColor, getRoleIcon } from '../../../modules/auth/auth.constants.js';
import UsersThunks from '../../../modules/users/users.thunks.js';

// Style
import './user.card.component.scss';

// UserCard Component
class UserCardComponent extends React.Component {

  handleChange = (e, { value }) => {
    const oldUser = this.props.user;
    const userToSave = {
      ...oldUser,
      Role: value
    };
    this.props.saveUser(userToSave);
  }

  renderDropDown = (user) => {
    return (
      <Button loading={user.isFetching} color={getRoleColor(user.role)} compact size='small'>
        <Icon name={getRoleIcon(user.role)} />
        {getRoleLabel(user.role)}
      </Button>
    );
  }

  render = () => {
    const user = this.props.user;
    const connectedUser = this.props.auth.user;
    const disabled = connectedUser.role !== AUTH_ADMIN_ROLE;
    const options = ALL_ROLES.map(role => {return { icon: getRoleIcon(role), value: role, text: getRoleLabel(role) };});
    const canGoToProfile = connectedUser.role === AUTH_ADMIN_ROLE || connectedUser.role === AUTH_SUPERVISOR_ROLE;
    return (
      <Card className='user'>
        <Card.Content>
          <Image avatar alt='Avatar' src='/images/avatar.jpg' />
          {
            canGoToProfile ?
              <Link to={`/users/${user.id}`}>
                {user.displayName}
              </Link>
            :
              user.displayName
          }
          <Dropdown trigger={this.renderDropDown(user)} compact onChange={this.handleChange} options={options}
            icon={null} button disabled={disabled} value={user.role} pointing className='tiny top right attached'
          />
        </Card.Content>
        <Card.Content extra>
          <Label size='tiny' className='right floated provider'>
            {user.provider.toUpperCase()}
          </Label>
          <div className='email' title={user.email}>
            <Icon name='mail' /> <a href={`mailto:${user.email}`}>{user.email}</a>
          </div>
        </Card.Content>
      </Card>
    );
  }
}

UserCardComponent.propTypes = {
  user: React.PropTypes.object,
  auth: React.PropTypes.object,
  saveUser: React.PropTypes.func.isRequired
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
    saveUser: (user) => {
      dispatch(UsersThunks.saveUser(user));
    }
  };
};

// Redux container to Sites component
const UserCard = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserCardComponent);

export default UserCard;
