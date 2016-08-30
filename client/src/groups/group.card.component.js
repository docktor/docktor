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
              <Link className='header' to={'/group/' + group.id} title={group.title}><i className='travel icon'></i>{group.title}</Link>
              <div className='right floated meta'>{moment(group.created).fromNow()}</div>
              <div className='description' title={group.description}>{group.description}</div>
            </div>
            <div className='extra content'>
                <i className='cube icon'></i>
                  {group.containers.length + ' container(s)'}
            </div>
          </div>
        );
    }
}
GroupCard.propTypes = { group: React.PropTypes.object };

export default GroupCard;
