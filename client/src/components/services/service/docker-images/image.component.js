// React
import React from 'react';

// Style
import './image.component.scss';

// Image
class Image extends React.Component {
  render() {
    const image = this.props.image;
    return (
      <div className='image-detail'>
        <div className='title layout horizontal justified center'>
          <span><i className='dropdown icon'></i>{image.name}</span>
          <span>
            <i className='copy link icon'></i>
            <i className='trash link icon'></i>
          </span>
        </div>
        <div className='content'>
          <p className='transition hidden'>{image.name}</p>
        </div>
      </div>
    );
  }
}

Image.propTypes = {
  image: React.PropTypes.object
};

export default Image;
