// React
import React from 'react';
import PropTypes from 'prop-types';

import Box from './box/box.component';

// Roles
import { ALL_GROUP_ROLES, getGroupRoleData } from '../../../modules/groups/groups.actions';

// MembersBox is a list of members
class MembersBox extends React.Component {

  state = { members: [] }
  membersRoles = ALL_GROUP_ROLES.map(role => {
    return {
      id: role,
      ...getGroupRoleData(role)
    };
  })

  componentWillMount = () => {
    this.setState({ members: this.props.members });
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({ members: nextProps.members });
  }

  isFormValid = () => {
    return this.refs.membersBox.isFormValid();
  }

  onChangeMembers = (members) => {
    this.state.members = members;
  }

  render = () => {
    const form = { fields:[] };

    form.getTitle = () => {
      return '';
    };

    form.fields.push({
      name: 'user',
      label: 'User',
      placeholder: 'Select a user',
      class: 'seven wide',
      required: true,
      options: this.props.users || [],
      type: 'autocomplete'
    });

    form.fields.push({
      name: 'role',
      label: 'Role',
      placeholder: 'Select role',
      class: 'six wide',
      required: true,
      options: this.membersRoles,
      type: 'select'
    });

    return (
      <Box
        ref='membersBox'
        icon='user'
        title='Members'
        form={form}
        lines={this.props.members}
        stacked={this.props.stacked}
        onChange={members => this.onChangeMembers(members)}>
        {this.props.children || ''}
      </Box>
    );
  }
}

MembersBox.propTypes = {
  members: PropTypes.array,
  users: PropTypes.array,
  stacked: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.element
  ])
};

export default MembersBox;
