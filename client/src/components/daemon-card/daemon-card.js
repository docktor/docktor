// React
import React from 'react';
import { Link } from 'react-router';

// Style
import './daemon-card.scss';

// DaemonCard Component
class DaemonCard extends React.Component {

    render() {
        const daemon = this.props.daemon;
        let site = this.props.site;
        if (!site) {
            site = { Title: 'unknown' };
        }
        return (
            <div className='daemon'>
                <div className='ui card'>
                    <div className='content'>
                        <Link className='header' to={'/daemon/' + daemon.ID}><i className='server icon'></i>{daemon.Name}</Link>
                        <div className='meta'>{site.Title}</div>
                        <div className='description'>{daemon.Description}</div>
                    </div>
                    <div className='ui bottom attached mini blue buttons'>
                        <div className='ui button'>{' Images'}</div>
                        <div className='ui button'>{' Containers'}</div>
                        <div className='ui icon button'>
                            <i className='refresh icon'></i>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
DaemonCard.propTypes = { daemon: React.PropTypes.object, site:React.PropTypes.object };

export default DaemonCard;
