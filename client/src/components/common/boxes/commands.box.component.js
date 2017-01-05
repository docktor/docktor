// React
import React from 'react';

import Box from './box/box.component.js';

// CommandsBox is a list of commands
class CommandsBox extends React.Component {

  state = { commands: [] }

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

    form.getTitle = (command) => {
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
  boxId: React.PropTypes.string,
  commands: React.PropTypes.array,
  stacked: React.PropTypes.bool,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.element
  ])
};

export default CommandsBox;
