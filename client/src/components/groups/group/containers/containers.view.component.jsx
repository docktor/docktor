// React
import React from 'react';
import { Table, Label, Button } from 'semantic-ui-react';
import sortBy from 'lodash.sortby';

import ContainerCard from './container.card.component';

// ContainersView Component
class ContainersView extends React.Component {

  renderTags = (entityContainingTags, allTags, tagToFilter, colorTagCategories) => {
    const tags = sortBy(entityContainingTags.tags.map(tag => allTags.items[tag]).filter(tag => Boolean(tag)), tag => tag.name.slug);
    return tags.map(t => {
      const tag = allTags.items[t.id];
      if (!Boolean(tagToFilter) || tag && tag.name.slug !== tagToFilter.name.slug) {
        return (<Label color={colorTagCategories[tag.category.slug]} key={tag.name.slug}>{tag.name.raw}</Label>);
      }
      return '';
    });
  }

  renderAsGrid(containers, daemons) {
    return containers.map(container => {
      return (<ContainerCard key={container.id} daemons={daemons} container={container} />);
    });
  }

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
            const service = services.items[container.serviceId] || { tags : [] };
            return (
            <Table.Row key={container.id}>
              <Table.Cell>{container.serviceTitle.toUpperCase()}</Table.Cell>
              <Table.Cell>{container.name}</Table.Cell>
              <Table.Cell>
                <Label.Group>
                {service.tags && this.renderTags(service, tags, tagToFilter, colorTagCategories)}
                {container.tags && this.renderTags(container, tags, tagToFilter, colorTagCategories)}
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
    const sortedContainers = sortBy(containers, [ c => c.serviceTitle.toLowerCase(), c => c.name.toLowerCase()]);
    return (<div className='flex layout center-justified horizontal wrap'>
      {display === 'grid' && this.renderAsGrid(sortedContainers, daemons, tagToFilter)}
      {display === 'list' && this.renderAsList(sortedContainers, tags, services, tagToFilter, colorTagCategories)}
    </div>);
  }
}
ContainersView.propTypes = {
  containers: React.PropTypes.array.isRequired,
  daemons: React.PropTypes.array.isRequired,
  display: React.PropTypes.string.isRequired,
  tagToFilter: React.PropTypes.object,
  services: React.PropTypes.object,
  tags : React.PropTypes.object,
  colorTagCategories: React.PropTypes.object
};

export default ContainersView;
