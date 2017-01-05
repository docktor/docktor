// React
import React from 'react';
import UUID from 'uuid-js';

import Box from './box/box.component.js';

// FilesystemsBox is a list of filesystems
class FilesystemsBox extends React.Component {

  constructor(props) {
    super(props);

    // Set state of component from the props.
    this.state = { filesystems: this.props.filesystems || [], options: {} };
  }

  isFormValid() {
    return this.refs.filesystemsBox.isFormValid();
  }

  onChangeFilesystems(filesystems) {
    this.state.filesystems = filesystems;
  }

  render() {
    const form = { fields:[] };

    form.getTitle = (filesystem) => {
      return '';
    };

    form.fields.push({
      name: 'daemon',
      label: 'Daemon',
      placeholder: 'Select a daemon',
      class: 'three wide',
      required: true,
      options: this.props.daemons || [],
      type: 'select'
    });

    form.fields.push({
      name: 'partition',
      label: 'Partition',
      placeholder: 'Select a partition',
      class: 'five wide',
      required: true,
      type: 'text'
    });

    form.fields.push({
      name: 'description',
      label: 'Description',
      placeholder: 'Describe this filesystem',
      class: 'seven wide',
      type: 'textarea',
      rows: 2
    });

    return (
      <Box
        ref='filesystemsBox'
        boxId={UUID.create(4).hex}
        icon='disk outline'
        title='Filesystems'
        form={form} options={this.state.options}
        lines={this.props.filesystems}
        stacked={this.props.stacked}
        onChange={filesystems => this.onChangeFilesystems(filesystems)}>
        {this.props.children || ''}
      </Box>
    );
  }
}

FilesystemsBox.propTypes = {
  filesystems: React.PropTypes.array,
  daemons: React.PropTypes.array,
  stacked: React.PropTypes.bool,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.element
  ])
};

export default FilesystemsBox;
