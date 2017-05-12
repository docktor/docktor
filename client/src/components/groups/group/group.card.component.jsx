// React
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Card, Icon, Button } from 'semantic-ui-react';

// Dependencies
import moment from 'moment';

// Style
import './group.card.component.scss';

// GroupCard Component
class GroupCard extends React.Component {
  render = () => {
    const group = this.props.group;
    const nbContainers = (group.containers ? group.containers.length : 0);
    const containers = nbContainers > 0 ? nbContainers + (nbContainers > 1 ? ' containers' : ' container') : 'No containers';
    return (
      <Card className='group-card'>
        <Card.Content>
          <Card.Header as={Link} to={`/groups/${group.id}/view`} title={group.title} className='link'>
            <Icon name='travel' />{group.title}
          </Card.Header>
          <Button as={Link} to={`/groups/${group.id}/edit`} title={'Edit ' + group.title} color='teal' size='tiny'
            compact className='top right attached' labelPosition='left' icon='edit' content='Edit'
          />
          <Card.Description title={group.description}>{group.description}</Card.Description>
        </Card.Content>
        <Card.Content extra className='layout horizontal'>
          <Icon name='cube' />
          <span className='flex'>{containers}</span>
          <span>{moment(group.created).fromNow()}</span>
        </Card.Content>
      </Card>
    );
  }
}

GroupCard.propTypes = { group: PropTypes.object };

export default GroupCard;
