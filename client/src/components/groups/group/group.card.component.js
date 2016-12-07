// React
import React from 'react';
import { Link } from 'react-router';

// Dependencies
import moment from 'moment';

// Style
import './group.card.component.scss';



// GroupCard Component
class GroupCard extends React.Component {
  render() {
    const group = this.props.group;
    return (
      <div className='ui card group'>
        <div className='content'>
          <div className='ui left floated link header'>
            <Link to={'/group/' + group.id} title={group.title}>
              <i className='travel icon'></i>{group.title}
            </Link>
          </div>
          <div className='ui right floated meta'>{moment(group.created).fromNow()}</div>
          <div className='description' title={group.description}>{group.description}</div>
        </div>
        <div className='extra content'>
          <i className='cube icon'></i>
          {(group.containers ? group.containers.length : 0) + ' container(s)'}
        </div>
      </div>
    );
  }
}
GroupCard.propTypes = { group: React.PropTypes.object };

export default GroupCard;
