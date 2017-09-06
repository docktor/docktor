// React
import React from 'react';
import PropTypes from 'prop-types';

class DetailsPane extends React.Component {
  render() {
    return (
      <div id='details'>
        <h1>{this.props.title}</h1>
        {/* TODO: add tags, groups, role... */}
      </div>
    );
  }
}

DetailsPane.propTypes = {
  title: PropTypes.string.isRequired
};

export default DetailsPane;
