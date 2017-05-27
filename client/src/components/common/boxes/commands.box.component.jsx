// React
import React from 'react';
import PropTypes from 'prop-types';

import Box from './box/box.component';

// Roles
import { ALL_GROUP_ROLES, getGroupRoleData } from '../../../modules/groups/groups.actions';

// CommandsBox is a list of commands
class CommandsBox extends React.Component {

  state = { commands: [] }
  membersRoles = ALL_GROUP_ROLES.map(role => {
    return {
      id: role,
      ...getGroupRoleData(role)
    };
  })

  componentWillMount = () => {
    this.setState({ commands: this.props.commands });
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({ commands: nextProps.commands });
  }

  isFormValid = () => {
    return this.refs.commandsBox.isFormValid();
  }

  onChangeCommands = (commands) => {
    this.state.commands = commands;
  }

  render = () => {
    const form = { fields:[] };

    form.getTitle = () => {
      return '';
    };

    form.fields.push({
      name: 'name',
      label: 'Name',
      placeholder: 'Command Name',
      class: 'three wide',
      required: true
    });

    form.fields.push({
      name: 'exec',
      label: 'Exec Command',
      placeholder: 'Command to execute',
      class: 'nine wide',
      required: true
    });

    form.fields.push({
      name: 'role',
      label: 'Role',
      placeholder: 'Select a role',
      class: 'three wide',
      required: true,
      options: this.membersRoles,
      default: 'member',
      type: 'select'
    });

    return (
      <Box
        ref='commandsBox'
        icon='terminal'
        title='Commands' form={form}
        lines={this.props.commands}
        stacked={this.props.stacked}
        onChange={this.onChangeCommands}>
        {this.props.children || ''}
      </Box>
    );
  }
}

CommandsBox.propTypes = {
  commands: PropTypes.array,
  stacked: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.element
  ])
};

export default CommandsBox;
