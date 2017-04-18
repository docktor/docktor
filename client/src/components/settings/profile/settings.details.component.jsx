// React
import React from 'react';

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
  title: React.PropTypes.string.isRequired
};

export default DetailsPane;
