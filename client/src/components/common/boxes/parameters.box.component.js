// React
import React from 'react';

import Box from './box/box.component.js';

// ParametersBox is a list of docker parameters
class ParametersBox extends React.Component {

  state = { parameters: [] }

  componentWillMount = () => {
    this.setState({ parameters: this.props.parameters });
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({ parameters: nextProps.parameters });
  }

  isFormValid = () => {
    return this.refs.parametersBox.isFormValid();
  }

  onChangeParameters = (parameters) => {
    this.state.parameters = parameters;
  }

  render = () => {
    const form = { fields:[] };
    const allowEmpty = this.props.allowEmpty;

    form.getTitle = (parameter) => {
      const dashCase = parameter.name.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
      return '--' + dashCase + '="' + (parameter.value || (allowEmpty ? '<Default Value>' : '' )) + '"';
    };

    form.fields.push({
      name: 'name',
      label: 'Parameter Name',
      placeholder: 'The name of the docker parameter',
      class: 'five wide',
      required: true
    });

    form.fields.push({
      name: 'value',
      label: allowEmpty ? 'Default Value' : 'Parameter Value',
      placeholder: 'The value of the docker parameter',
      class: 'five wide',
      required: !allowEmpty
    });

    form.fields.push({
      name: 'description',
      label: 'Description',
      placeholder: 'Describe this parameter',
      class: 'five wide',
      type: 'textarea',
      rows: 2
    });

    return (
      <Box
        ref='parametersBox'
        icon='configure'
        title='Parameters' form={form}
        lines={this.props.parameters}
        stacked={this.props.stacked}
        onChange={this.onChangeParameters}>
        {this.props.children || ''}
      </Box>
    );
  }
}

ParametersBox.propTypes = {
  parameters: React.PropTypes.array,
  allowEmpty: React.PropTypes.bool,
  stacked: React.PropTypes.bool,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.element
  ])
};

export default ParametersBox;
