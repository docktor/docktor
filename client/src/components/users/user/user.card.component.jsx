// React
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Card, Icon, Image, Dropdown, Button, Label } from 'semantic-ui-react';

import { AUTH_ADMIN_ROLE, AUTH_SUPERVISOR_ROLE, ALL_ROLES, getRoleLabel, getRoleColor, getRoleIcon } from '../../../modules/auth/auth.constants';
import UsersThunks from '../../../modules/users/users.thunks';
import ToastsActions from '../../../modules/toasts/toasts.actions';

// Style
import './user.card.component.scss';

// UserCard Component
class UserCardComponent extends React.Component {

  handleChange = (_, { value }) => {
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
      <Card className='user-card'>
        <Card.Content>
          <Image avatar alt='Avatar' src={require('./images/avatar.jpg')} />
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
            <a href={`mailto:${user.email}`}><Icon name='mail' />{user.email}</a>
          </div>
        </Card.Content>
      </Card>
    );
  }
}

UserCardComponent.propTypes = {
  user: PropTypes.object,
  auth: PropTypes.object,
  saveUser: PropTypes.func.isRequired
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
      dispatch(UsersThunks.save(user, null, ToastsActions.confirmSave(`User "${user.displayName}"`)));
    }
  };
};

// Redux container to Sites component
const UserCard = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserCardComponent);

export default UserCard;
