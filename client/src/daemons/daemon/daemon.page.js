// React
import React from 'react';
import { connect } from 'react-redux';

import { fetchDaemon } from './daemon.thunks.js';

// Daemon Component
class DaemonComponent extends React.Component {

  componentWillMount() {
    const daemonId = this.props.daemonId;
    if (typeof daemonId !== 'undefined' && daemonId !== '') {
      // Fetch when known daemon
      this.props.fetchDaemon(daemonId);
    } else {
      // New daemon
    }
  }

  render() {
    const { item, isFetching } = this.props.daemon;
    return (
      <div>{this.props.daemonId}{item.name}</div>
    );
  }
}
DaemonComponent.propTypes = {
  daemon: React.PropTypes.object,
  daemonId: React.PropTypes.string,
  fetchDaemon: React.PropTypes.func.isRequired
};

// Function to map state to container props
const mapStateToProps = (state, ownProps) => {
  return {
    daemon: state.daemon,
    daemonId: ownProps.params.id
  };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    fetchDaemon : (id) => {dispatch(fetchDaemon(id));},
  };
};

// Redux container to Sites component
const DaemonPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(DaemonComponent);

export default DaemonPage;
