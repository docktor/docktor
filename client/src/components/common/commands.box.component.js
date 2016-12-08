// React
import React from 'react';

import Box from './boxes/box.component.js';

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
        { value:'admin', name:'Admin Role' },
        { value:'user', name:'User Role' }
      ],
      type: 'select'
    });

    return (
      <Box
        ref='commandsBox'
        boxId='Commands'
        icon='large terminal icon'
        title='Commands' form={form}
        lines={this.props.commands}
        onChange={commands => this.onChangeCommands(commands)}>
        {this.props.children || ''}
      </Box>
    );
  }
}

CommandsBox.propTypes = {
  commands: React.PropTypes.array,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.element
  ])
};

export default CommandsBox;
