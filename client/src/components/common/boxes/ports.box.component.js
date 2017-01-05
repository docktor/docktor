// React
import React from 'react';

import Box from './box/box.component.js';

// PortsBox is a list of ports
class PortsBox extends React.Component {

  constructor(props) {
    super(props);

    // Set state of component from the props.
    this.state = { ports: this.props.ports || [] };
  }

  isFormValid() {
    return this.refs.portsBox.isFormValid();
  }

  onChangePorts(ports) {
    this.state.ports = ports;
  }

  render() {
    const form = { fields:[] };

    form.getTitle = (port) => {
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
        boxId={this.props.boxId}
        icon='large sitemap icon'
        title='Ports' form={form}
        lines={this.props.ports}
        stacked={this.props.stacked}
        onChange={ports => this.onChangePorts(ports)}>
        {this.props.children || ''}
      </Box>
    );
  }
}

PortsBox.propTypes = {
  boxId: React.PropTypes.string,
  ports: React.PropTypes.array,
  stacked: React.PropTypes.bool,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.element
  ])
};

export default PortsBox;
