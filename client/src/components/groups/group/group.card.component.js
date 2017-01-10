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
    const nbContainers = (group.containers ? group.containers.length : 0);
    return (
      <div className='ui card group'>
        <div className='content'>
          <div className='ui left floated link header'>
            <Link to={'/view/' + group.id} title={group.title}>
              <i className='travel icon' />{group.title}
            </Link>
          </div>
          <Link to={'/groups/' + group.id} title={'Edit ' + group.title} className='ui tiny compact top right attached right labeled icon teal button'>
            <i className='edit icon'/> Edit
          </Link>
          <div className='description' title={group.description}>{group.description}</div>
        </div>
        <div className='extra content'>
          <i className='cube icon' />
          {`${nbContainers} ${nbContainers > 1 ? 'Containers' : 'Container'}`}
          <div className='ui right floated'>{moment(group.created).fromNow()}</div>
        </div>
      </div>
    );
  }
}
GroupCard.propTypes = { group: React.PropTypes.object };

export default GroupCard;
