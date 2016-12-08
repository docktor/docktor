// React
import React from 'react';

import Box from './boxes/box.component.js';

// VariablesBox is a list of docker variables
class VariablesBox extends React.Component {

  constructor(props) {
    super(props);

    // Set state of component from the props.
    this.state = { variables: this.props.variables || [] };
  }

  isFormValid() {
    return this.refs.variablesBox.isFormValid();
  }

  onChangeVariables(variables) {
    this.state.variables = variables;
  }

  render() {
    const form = { fields:[] };
    const allowEmpty = this.props.allowEmpty;

    form.getTitle = (variable) => {
      return '-e ' + variable.name + '=' + (variable.value || (allowEmpty ? '<Default Value>' : '' ));
    };

    form.fields.push({
      name: 'name',
      label: 'Variable Name',
      placeholder: 'The environment variable name',
      sizeClass: 'five wide',
      isRequired: true
    });

    form.fields.push({
      name: 'value',
      label: allowEmpty ? 'Default Value' : 'Variable Value',
      placeholder: 'The environment variable value',
      sizeClass: 'five wide',
      isRequired: !allowEmpty
    });

    form.fields.push({
      name: 'description',
      label: 'Description',
      placeholder: 'Describe this variable',
      sizeClass: 'five wide',
      type: 'textarea',
      rows: 2
    });

    return (
      <Box
        ref='variablesBox'
        boxId='Variables'
        icon='large setting icon'
        title='Variables' form={form}
        lines={this.props.variables}
        onChange={variables => this.onChangeVariables(variables)}>
        {this.props.children || ''}
      </Box>
    );
  }
}

VariablesBox.propTypes = {
  variables: React.PropTypes.array,
  allowEmpty: React.PropTypes.bool,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.element
  ])
};

export default VariablesBox;
