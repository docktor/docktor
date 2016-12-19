// React
import React from 'react';
import { Link } from 'react-router';

// Dependencies
import moment from 'moment';

// Style
import './service.card.component.scss';



// ServiceCard Component
class ServiceCard extends React.Component {
  render() {
    const service = this.props.service;
    const nbImages = service.images.length;
    return (
        <div className='ui card service'>
          <div className='content'>
            <Link className='header' to={'/services/' + service.id} title={service.title}><i className='cube icon' />{service.title}</Link>
          </div>
          <div className='extra content'>
            <span className='right floated'>
              <i className='calendar icon' />
              {moment(service.created).fromNow()}
            </span>
            <i className='file archive outline icon' />
            {`${nbImages} ${nbImages > 1 ? 'Images' : 'Image'}`}
          </div>
        </div>
    );
  }
}
ServiceCard.propTypes = { service: React.PropTypes.object };

export default ServiceCard;
