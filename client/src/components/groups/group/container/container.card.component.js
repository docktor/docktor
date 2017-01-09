// React
import React from 'react';
import { Link } from 'react-router';

// Dependencies
import moment from 'moment';

// Style
import './container.card.component.scss';

// ContainerCard Component
class ContainerCard extends React.Component {
  render() {
    const { container, daemons } = this.props;
    const isFetching = false;
    const daemon = daemons.filter(daemon => container.daemonId === daemon.value)[0] || { 'name': 'Unknown' };
    const statusMessage = `Container is up on daemon '${daemon.name}'`;
    return (
      <div className='container'>
        <div className='ui card'>
          <div className='content'>
            <div className='header'>
              <Link className='header' to={'containers/' + container.id}>
                {container.serviceTitle}
              </Link>
            </div>
            <div title={statusMessage} className={'ui top right attached' + (isFetching ? ' disabled' : '') + ' label green'}>
              <i className='refresh icon' />UP
            </div>
            <div className='meta'>{container.name}</div>
            <div className='description'>{container.image}</div>
          </div>
          <div className='ui bottom attached buttons'>
            <div className='ui icon disabled button'><i className='stop icon' />Stop</div>
            <div className='ui icon disabled button'><i className='play icon' />Start</div>
            <div className='ui icon disabled button'><i className='repeat icon' />Restart</div>
            <div className='ui icon disabled button'><i className='cloud upload icon' />Deploy</div>
          </div>
        </div>
      </div>
    );
  }
}
ContainerCard.propTypes = { container: React.PropTypes.object, daemons: React.PropTypes.array };

export default ContainerCard;
