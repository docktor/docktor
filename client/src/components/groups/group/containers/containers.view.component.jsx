// React
import React from 'react';
import PropTypes from 'prop-types';
import { Table, Label, Button, Icon } from 'semantic-ui-react';
import sortBy from 'lodash.sortby';

import { GRID_DISPLAY, LIST_DISPLAY } from './containers.component.constants.js';

import ContainerCard from './container.card.component';

// ContainersView Component
class ContainersView extends React.Component {

  // Render the tags
  renderTags = (tagsFromEntity, allTags, tagToFilter, colorTagCategories) => {
    // Get enriched tags, sort by name
    const tags = sortBy(tagsFromEntity.map(tag => allTags.items[tag]).filter(tag => Boolean(tag)), tag => tag.name.slug);
    // Return tags as labels
    return tags.map(t => {
      const tag = allTags.items[t.id];
      if (!Boolean(tagToFilter) || tag && tag.name.slug !== tagToFilter.name.slug) {
        // The tag filtered is the one from the category used to group by the view
        return (<Label color={colorTagCategories[tag.category.slug] || ''} key={tag.name.slug}>{tag.name.raw}</Label>);
      }
      return '';
    });
  }

  // Render the containers, as a grid
  renderAsGrid(containers, daemons) {
    return containers.map(container => {
      return (<ContainerCard key={container.id} daemons={daemons} container={container} />);
    });
  }

  // Render the containers as a list
  renderAsList(containers, tags, services, tagToFilter, colorTagCategories) {
    return (
      <Table fixed celled compact='very'>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width='three'>Service</Table.HeaderCell>
            <Table.HeaderCell width='three'>Name</Table.HeaderCell>
            <Table.HeaderCell width='eight'>Tags</Table.HeaderCell>
            <Table.HeaderCell width='two' textAlign='center'>Status</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {containers.map(container => {
            const service = services.items[container.serviceId] || { };
            const containerTags = container.tags || [];
            const serviceTags = service.tags || [] ;
            return (
            <Table.Row key={container.id}>
              <Table.Cell>{container.serviceTitle.toUpperCase() || service.title.toUpperCase() || 'Unknown'}</Table.Cell>
              <Table.Cell>{container.name}</Table.Cell>
              <Table.Cell>
                {services.isFetching && <span><Icon loading name='notched circle' />Loading...</span>}
                {containerTags.length === 0 && serviceTags.length === 0 && <span>No tag</span>}
                <Label.Group>
                {this.renderTags(serviceTags, tags, tagToFilter, colorTagCategories)}
                {this.renderTags(containerTags, tags, tagToFilter, colorTagCategories)}
                </Label.Group>
              </Table.Cell>
              <Table.Cell textAlign='center'>
                <Button compact size='tiny' color='green' content='UP' labelPosition='right' icon='refresh' />
              </Table.Cell>
            </Table.Row>
            );
          })
          }
        </Table.Body>
      </Table>
    );
  }

  render = () => {
    const { containers, daemons, tags, services } = this.props;
    const { display, tagToFilter, colorTagCategories } = this.props;
    // Sort the containers by their service title, then their instance name
    const sortedContainers = sortBy(containers, [ c => c.serviceTitle.toLowerCase(), c => c.name.toLowerCase()]);
    return (
      <div className='flex layout center-justified horizontal wrap'>
        {display === GRID_DISPLAY && this.renderAsGrid(sortedContainers, daemons, tagToFilter)}
        {display === LIST_DISPLAY && this.renderAsList(sortedContainers, tags, services, tagToFilter, colorTagCategories)}
      </div>
    );
  }
}
ContainersView.propTypes = {
  containers: PropTypes.array.isRequired,
  daemons: PropTypes.object.isRequired,
  display: PropTypes.string.isRequired,
  tagToFilter: PropTypes.object,
  services: PropTypes.object.isRequired,
  tags : PropTypes.object.isRequired,
  colorTagCategories: PropTypes.object.isRequired
};

export default ContainersView;
