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
      return (
        <div className='ui card service'>
          <div className='content'>
            <Link className='header' to={'/service/' + service.ID} title={service.Title}><i className='cube icon'></i>{service.Title}</Link>
          </div>
          <div className='extra content'>
            <span className='right floated'>
              <i className='calendar icon'></i>
              {moment(service.Created).fromNow()}
            </span>
            <i className='file archive outline icon'></i>
            {service.Images.length + ' image(s)'}
          </div>
        </div>
      );
    }
}
ServiceCard.propTypes = { service: React.PropTypes.object };

export default ServiceCard;
