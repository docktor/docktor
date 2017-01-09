// React
import React from 'react';
import UUID from 'uuid-js';

import Box from './box/box.component.js';

// Roles
import { ALL_GROUP_ROLES, getGroupRoleData } from '../../../modules/groups/groups.constants.js';

// MembersBox is a list of members
class MembersBox extends React.Component {

  constructor(props) {
    super(props);

    // Set state of component from the props.
    this.state = { members: this.props.members || [], options: {} };
    this.membersRoles = ALL_GROUP_ROLES.map(role => {
      return {
        id: role,
        ...getGroupRoleData(role)
      };
    });
  }

  isFormValid() {
    return this.refs.membersBox.isFormValid();
  }

  onChangeMembers(members) {
    this.state.members = members;
  }

  render() {
    const form = { fields:[] };

    form.getTitle = (member) => {
      return '';
    };

    form.fields.push({
      name: 'user',
      label: 'User',
      placeholder: 'Select a user',
      sizeClass: 'seven wide',
      isRequired: true,
      options: this.props.users,
      type: 'autocomplete'
    });

    form.fields.push({
      name: 'role',
      label: 'Role',
      placeholder: 'Select role',
      sizeClass: 'six wide',
      isRequired: true,
      options: this.membersRoles,
      type: 'select'
    });

    return (
      <Box
        ref='membersBox'
        boxId={UUID.create(4).hex}
        icon='large users outline icon'
        title='Members'
        form={form} options={this.state.options}
        lines={this.props.members || []}
        stacked={this.props.stacked}
        onChange={members => this.onChangeMembers(members)}>
        {this.props.children || ''}
      </Box>
    );
  }
}

MembersBox.propTypes = {
  members: React.PropTypes.array,
  users: React.PropTypes.array,
  stacked: React.PropTypes.bool,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.element
  ])
};

export default MembersBox;
