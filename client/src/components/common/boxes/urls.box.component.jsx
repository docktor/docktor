// React
import React from 'react';
import PropTypes from 'prop-types';

import Box from './box/box.component';

// URLsBox is a list of docker urls
class URLsBox extends React.Component {

  state = { urls: [] }

  componentWillMount = () => {
    this.setState({ urls: this.props.urls });
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({ urls: nextProps.urls });
  }

  isFormValid = () => {
    return this.refs.urlsBox.isFormValid();
  }

  onChangeURLs = (urls) => {
    this.state.urls = urls;
  }

  render = () => {
    const form = { fields:[] };

    form.getTitle = () => {
      return '';
    };

    form.fields.push({
      name: 'label',
      label: 'Label',
      placeholder: 'Label',
      class: 'seven wide',
      required: true
    });

    form.fields.push({
      name: 'url',
      label: 'URL',
      placeholder: 'URL',
      class: 'eight wide',
      required: true
    });

    return (
      <Box
        ref='urlsBox'
        icon='linkify'
        title='URLs' form={form}
        lines={this.props.urls}
        stacked={this.props.stacked}
        onChange={this.onChangeURLs}>
        {this.props.children || ''}
      </Box>
    );
  }
}

URLsBox.propTypes = {
  urls: PropTypes.array,
  stacked: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.element
  ])
};

export default URLsBox;
