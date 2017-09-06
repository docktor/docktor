// React
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { Input, Dimmer, Loader, Label, Icon } from 'semantic-ui-react';
import DebounceInput from 'react-debounce-input';

// API Fetching
import UsersThunks from '../../modules/users/users.thunks';
import UsersActions from '../../modules/users/users.actions';

// Selectors
import { getFilteredUsers } from '../../modules/users/users.selectors';

// Components
import UserCard from './user/user.card.component';

// Style
import './users.page.scss';

//Site Component using react-leaflet
class Users extends React.Component {

  componentWillMount = () => {
    this.props.fetchUsers();
  }

  render = () => {
    const { users, filterValue, isFetching, changeFilter } = this.props;
    return (
      <div className='flex layout vertical start-justified users-page'>
        <div className='layout horizontal justified users-bar'>
          <Input icon labelPosition='left corner' className='flex'>
            <Label corner='left' icon='search' />
            <DebounceInput
              placeholder='Search...'
              minLength={1}
              debounceTimeout={300}
              onChange={(event) => changeFilter(event.target.value)}
              value={filterValue}
            />
            <Icon link name='remove' onClick={() => changeFilter('')}/>
          </Input>
          <div className='flex-2' />
        </div>
        <Scrollbars autoHide className='flex ui dimmable'>
          <div className='flex layout horizontal center-center wrap user-list'>
            {isFetching && <Dimmer active><Loader size='large' content='Fetching'/></Dimmer>}
            {users.map(user => {
              return (
                <UserCard user={user} key={user.id} />
              );
            })}
          </div>
        </Scrollbars>
      </div>
    );
  }
}

Users.propTypes = {
  users: PropTypes.array,
  filterValue: PropTypes.string,
  isFetching: PropTypes.bool,
  fetchUsers: PropTypes.func.isRequired,
  changeFilter: PropTypes.func.isRequired
};

// Function to map state to container props
const mapStateToUsersProps = (state) => {
  const filterValue = state.users.filterValue;
  const users = getFilteredUsers(state.users.items, filterValue);
  const isFetching = state.users.isFetching;
  return { filterValue, users, isFetching };
};

// Function to map dispatch to container props
const mapDispatchToUsersProps = (dispatch) => {
  return {
    fetchUsers : () => dispatch(UsersThunks.fetchAll()),
    changeFilter: filterValue => dispatch(UsersActions.changeFilter(filterValue))
  };
};

// Redux container to Sites component
const UsersPage = connect(
  mapStateToUsersProps,
  mapDispatchToUsersProps
)(Users);

export default UsersPage;
