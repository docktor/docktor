// React
import React from 'react';

import Box from './box/box.component.js';

// VariablesBox is a list of docker variables
class VariablesBox extends React.Component {

  state = { variables: [] }

  componentWillMount = () => {
    this.setState({ variables: this.props.variables });
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({ variables: nextProps.variables });
  }

  isFormValid = () => {
    return this.refs.variablesBox.isFormValid();
  }

  onChangeVariables = (variables) => {
    this.state.variables = variables;
  }

  render = () => {
    const form = { fields:[] };
    const allowEmpty = this.props.allowEmpty;

    form.getTitle = (variable) => {
      return '-e ' + variable.name + '=' + (variable.value || (allowEmpty ? '<Default Value>' : '' ));
    };

    form.fields.push({
      name: 'name',
      label: 'Variable Name',
      placeholder: 'The environment variable name',
      class: 'five wide',
      required: true
    });

    form.fields.push({
      name: 'value',
      label: allowEmpty ? 'Default Value' : 'Variable Value',
      placeholder: 'The environment variable value',
      class: 'five wide',
      required: !allowEmpty
    });

    form.fields.push({
      name: 'description',
      label: 'Description',
      placeholder: 'Describe this variable',
      class: 'five wide',
      type: 'textarea',
      rows: 2
    });

    return (
      <Box
        ref='variablesBox'
        icon='setting'
        title='Variables' form={form}
        lines={this.props.variables}
        stacked={this.props.stacked}
        onChange={this.onChangeVariables}>
        {this.props.children || ''}
      </Box>
    );
  }
}

VariablesBox.propTypes = {
  variables: React.PropTypes.array,
  allowEmpty: React.PropTypes.bool,
  stacked: React.PropTypes.bool,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.element
  ])
};

export default VariablesBox;
