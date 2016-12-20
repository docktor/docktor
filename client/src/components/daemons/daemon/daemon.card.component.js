// React
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import classNames from 'classnames';

// Components
import DaemonsThunks from '../../../modules/daemons/daemons.thunks.js';

// Style
import './daemon.card.component.scss';

// DaemonCard Component
class DaemonCard extends React.Component {

  componentWillMount() {
    const daemon = this.props.daemon;
    const fetchFunc = this.props.fetchInfo(daemon, false);
    fetchFunc();
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
    const { daemon, fetchInfo } = this.props;
    const { isFetching, info } = daemon;
    let site = this.props.site;
    if (!site) {
      site = { title: 'Unknown Site' };
    }

    const daemonStatusClasses = classNames('ui top right attached label', this.getColor(info), {
      disabled: isFetching
    });

    return (
      <div className='daemon'>
        <div className='ui card'>
          <div className='content'>
            <div className='header'>
              <Link className='header' to={'/daemons/' + daemon.id}>
                <i className='server icon' />{daemon.name}
              </Link>
            </div>
            <div title={info ? info.message : ''} className={daemonStatusClasses}>
              {(info ? info.status : 'UNKNOWN')}
            </div>
            <div className='meta'>{site.title}</div>
            <div className='description'>{daemon.description}</div>
          </div>
          {(fetching => {
            if (fetching) {
              return (
                  <div className='ui bottom attached mini blue buttons'>
                    <div className='ui button loading' />
                  </div>
              );
            } else {
              return (
                  <div className='ui bottom attached mini blue buttons'>
                    <div className='ui button disabled'>{(info && info.nbImages ? info.nbImages : '0') + ' Image(s)'}</div>
                    <div className='ui button disabled'>{(info && info.nbContainers ? info.nbContainers : '0') + ' Container(s)'}</div>
                    <div className='ui icon button' onClick={fetchInfo(daemon, true)}>
                      <i className='refresh icon' />
                    </div>
                  </div>
                </div>
              );
            }
          })(isFetching)}
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
    fetchInfo: (daemon, force) => () => dispatch(DaemonsThunks.fetchDaemonInfo(daemon, force))
  };
};

// Redux container
const CardDaemon = connect(
  mapStateToProps,
  mapDispatchToProps
)(DaemonCard);

export default CardDaemon;
