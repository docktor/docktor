// React
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

// Components
import { fetchDaemonInfo } from './daemons.thunks.js';

// Style
import './daemon.card.component.scss';

// DaemonCard Component
class DaemonCard extends React.Component {

    componentWillMount() {
      const daemon = this.props.daemon;
      this.props.fetchInfo(daemon, false)();
    }

    getColor(info) {
      if (!info) {
        return 'grey';
      } else if (info.status === 'UP') {
        return 'green';
      } else {
        return 'red';
      }
    }

    render() {
        const daemon = this.props.daemon;
        const fetchInfo = this.props.fetchInfo;
        const isFetching = daemon.isFetching;
        const info = daemon.info;
        let site = this.props.site;
        if (!site) {
            site = { Title: 'unknown' };
        }
        return (
            <div className='daemon'>
                <div className='ui card'>
                    <div className='content'>
                        <div className='header'>
                          <Link className='header' to={'/daemon/' + daemon.id}>
                            <i className='server icon'></i>{daemon.name}
                          </Link>
                          <div title={info ? info.message : ''} className={'ui right floated' + (isFetching ? ' disabled' : '') + ' label ' + this.getColor(info)}>
                            {(info ? info.status : 'UNKNOWN')}
                          </div>
                        </div>
                        <div className='meta'>{site.title}</div>
                        <div className='description'>{daemon.description}</div>
                    </div>
                    <div className='ui bottom attached mini blue buttons'>
                        <div className={'ui button' + (isFetching ? ' loading' : ' disabled')}>{(info && info.images ? info.images : '0') + ' Image(s)'}</div>
                        <div className={'ui button' + (isFetching ? ' loading' : ' disabled')}>{(info && info.containers ? info.containers : '0') + ' Container(s)'}</div>
                        <div className={'ui icon button' + (isFetching ? ' disabled' : '')} onClick={fetchInfo(daemon, true)}>
                            <i className='refresh icon'></i>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
DaemonCard.propTypes = {
  daemon: React.PropTypes.object,
  site: React.PropTypes.object,
  fetchInfo: React.PropTypes.func
};
// Function to map state to container props
const mapStateToProps = (state) => {
  return {};
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    fetchInfo: (daemon, force) => () => dispatch(fetchDaemonInfo(daemon, force))
  };
};

// Redux container
const CardDaemon = connect(
  mapStateToProps,
  mapDispatchToProps
)(DaemonCard);
export default CardDaemon;
