// React
import React from 'react';

import Box from './boxes/box.component.js';

// VolumesBox is a list of docker volumes
class VolumesBox extends React.Component {

  constructor(props) {
    super(props);

    // Set state of component from the props.
    this.state = { volumes: this.props.volumes || [] };
  }

  isFormValid() {
    return this.refs.volumesBox.isFormValid();
  }

  onChangeVolumes(volumes) {
    this.state.volumes = volumes;
  }

  render() {
    const form = { fields:[] };

    form.getTitle = (volume) => {
        return '-v ' + volume.external + ':' + volume.internal + ':' + volume.rights;
    };

    form.fields.push({
      name: 'external',
      label: 'External Volume',
      placeholder: 'The default volume on host',
      sizeClass: 'five wide',
      isRequired: true
    });

    form.fields.push({
      name: 'internal',
      label: 'Internal Volume',
      placeholder: 'The volume inside the container',
      sizeClass: 'five wide',
      isRequired: true
    });
    form.fields.push({
      name: 'rights',
      label: 'Rights',
      placeholder: 'Select rights',
      sizeClass: 'three wide',
      isRequired: true,
      options: [
        { value:'ro', name:'Read-only' },
        { value:'rw', name:'Read-write' }
      ],
      type: 'select'
    });

    form.fields.push({
      name: 'description',
      label: 'Description',
      placeholder: 'Describe this volume',
      sizeClass: 'three wide',
      type: 'textarea',
      rows: 2
    });

    return (
      <Box
        ref='volumesBox'
        boxId='Volumes'
        icon='large folder open icon'
        title='Volumes' form={form}
        lines={this.props.volumes}
        onChange={volumes => this.onChangeVolumes(volumes)}>
        {this.props.children || ''}
      </Box>
    );
  }
};

VolumesBox.propTypes = {
  volumes: React.PropTypes.array,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.element
  ])
};

export default VolumesBox;
