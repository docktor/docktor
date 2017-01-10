// React
import React from 'react';
import classNames from 'classnames';
import { Card, Icon, Label, Popup } from 'semantic-ui-react';

import { ALL_ROLES, getRoleData } from '../../../modules/auth/auth.constants.js';

// Style
import './category.card.scss';

// CategoryCard Component
class CategoryCard extends React.Component {

  roles = {}

  componentWillMount = () => {
    ALL_ROLES.forEach(role => {
      this.roles[role] = getRoleData(role);
    });
  }

  render = () => {
    const { category, onDelete, onEdit, tags } = this.props;
    return (
      <Card className='category-card'>
        <Card.Content>
          <Popup offset={15} inverted wide='very' positioning='left center'
            trigger={<Card.Header className='with-title' content={category.value} />}
            content={category.value}
          />
        </Card.Content>
        <Card.Content>
          {tags.map(tag => {
            let role = this.roles[tag.usageRights];
            return (
              <Label key={tag.name.slug} className={classNames({ 'disabled not-active': tag.isDeleting })}>
                <Popup offset={15} inverted wide='very' positioning='left center'
                  trigger= {
                    <Icon color={tag.isEditing ? null : role.color} name={tag.isEditing ? 'notched circle' : role.icon}
                      loading={tag.isEditing} className='with-title'
                    />
                  }
                  content={`Tag can be added or removed by role : ${role.value}`}
                />
                <a className={classNames({ 'disabled not-active': tag.isDeleting || tag.isEditing })} onClick={() => onEdit(tag)}>{tag.name.raw}</a>
                <Icon name='delete' loading={tag.isDeleting} className={classNames({ 'disabled not-active': tag.isDeleting })}
                  onClick={() => onDelete(tag)}
                />
              </Label>
            );
          })}
        </Card.Content>
      </Card>
    );
  }
}

CategoryCard.propTypes = {
  category: React.PropTypes.object.isRequired,
  tags: React.PropTypes.array.isRequired,
  onDelete: React.PropTypes.func.isRequired,
  onEdit: React.PropTypes.func.isRequired
};

export default CategoryCard;
