// React
import React from 'react';
import { Link } from 'react-router';

// Dependencies
import moment from 'moment';

// Style
import './category.card.scss';

// CategoryCard Component
class CategoryCard extends React.Component {

  render() {
    const category = this.props.category;
    const { tags } = category;

    return (
      <div className='ui card category'>
        <div className='content'>
          <div className='header'>{category.raw}</div>
        </div>
        <div className='content'>
          {tags.map(tag => {
            return (
              <div key={tag.name.slug}>{tag.name.raw}</div>
            );
          })}
        </div>
      </div>
    );
  }
}

CategoryCard.propTypes = { category: React.PropTypes.object };

export default CategoryCard;
