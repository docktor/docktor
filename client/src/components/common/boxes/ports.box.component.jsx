// React
import React from 'react';
import PropTypes from 'prop-types';

import Box from './box/box.component';

// PortsBox is a list of ports
class PortsBox extends React.Component {

  state = { ports: [] }

  componentWillMount = () => {
    this.setState({ ports: this.props.ports });
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({ ports: nextProps.ports });
  }

  isFormValid = () => {
    return this.refs.portsBox.isFormValid();
  }

  onChangePorts = (ports) => {
    this.state.ports = ports;
  }

  render = () => {
    const form = { fields:[] };

    form.getTitle = () => {
      return '';
    };

    form.fields.push({
      name: 'internal',
      label: 'Internal',
      placeholder: 'Internal Port',
      class: 'three wide',
      required: true,
      type: 'number'
    });

    form.fields.push({
      name: 'protocol',
      label: 'Protocol',
      placeholder: 'Protocol',
      class: 'three wide',
      required: true,
      options: [
        { value:'tcp', name:'TCP' },
        { value:'udp', name:'UDP' }
      ],
      default: 'tcp',
      type: 'select'
    });

    form.fields.push({
      name: 'description',
      label: 'Description',
      placeholder: 'Describe this Port',
      class: 'five wide',
      type: 'textarea',
      rows: 2
    });

    return (
      <Box
        ref='portsBox'
        icon='sitemap'
        title='Ports' form={form}
        lines={this.props.ports}
        stacked={this.props.stacked}
        onChange={this.onChangePorts}>
        {this.props.children || ''}
      </Box>
    );
  }
}

PortsBox.propTypes = {
  ports: PropTypes.array,
  stacked: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.element
  ])
};

export default PortsBox;
