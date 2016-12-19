// React
import React from 'react';

import Box from './box/box.component.js';

// CommandsBox is a list of commands
class CommandsBox extends React.Component {

  constructor(props) {
    super(props);

    // Set state of component from the props.
    this.state = { commands: this.props.commands || [] };
  }

  isFormValid() {
    return this.refs.commandsBox.isFormValid();
  }

  onChangeCommands(commands) {
    this.state.commands = commands;
  }

  render() {
    const form = { fields:[] };

    form.getTitle = (command) => {
      return '';
    };

    form.fields.push({
      name: 'name',
      label: 'Name',
      placeholder: 'Command Name',
      sizeClass: 'three wide',
      isRequired: true
    });

    form.fields.push({
      name: 'exec',
      label: 'Exec Command',
      placeholder: 'Command to execute',
      sizeClass: 'nine wide',
      isRequired: true
    });

    form.fields.push({
      name: 'role',
      label: 'Role',
      placeholder: 'Select a role',
      sizeClass: 'three wide',
      isRequired: true,
      options: [
        { value:'moderator', name:'Moderators' },
        { value:'member', name:'Members' }
      ],
      default: 'member',
      type: 'select'
    });

    return (
      <Box
        ref='commandsBox'
        boxId={this.props.boxId}
        icon='large terminal icon'
        title='Commands' form={form}
        lines={this.props.commands}
        stacked={this.props.stacked}
        onChange={commands => this.onChangeCommands(commands)}>
        {this.props.children || ''}
      </Box>
    );
  }
}

CommandsBox.propTypes = {
  boxId: React.PropTypes.string,
  commands: React.PropTypes.array,
  stacked: React.PropTypes.bool,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.element
  ])
};

export default CommandsBox;
