// React
import React from 'react';
import PropTypes from 'prop-types';

import Box from './box/box.component';

// FilesystemsBox is a list of filesystems
class FilesystemsBox extends React.Component {

  state = { filesystems: [] }

  componentWillMount = () => {
    this.setState({ filesystems: this.props.filesystems });
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({ filesystems: nextProps.filesystems });
  }

  isFormValid = () => {
    return this.refs.filesystemsBox.isFormValid();
  }

  onChangeFilesystems = (filesystems) => {
    this.state.filesystems = filesystems;
  }

  render = () => {
    const form = { fields:[] };

    form.getTitle = () => {
      return '';
    };

    form.fields.push({
      name: 'daemon',
      label: 'Daemon',
      placeholder: 'Select a daemon',
      class: 'three wide',
      required: true,
      options: this.props.daemons || [],
      type: 'autocomplete'
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
        icon='disk outline'
        title='Filesystems'
        form={form}
        lines={this.props.filesystems}
        stacked={this.props.stacked}
        onChange={this.onChangeFilesystems}>
        {this.props.children || ''}
      </Box>
    );
  }
}

FilesystemsBox.propTypes = {
  filesystems: PropTypes.array,
  daemons: PropTypes.array,
  stacked: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.element
  ])
};

export default FilesystemsBox;