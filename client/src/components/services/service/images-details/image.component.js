// React
import React from 'react';

// Style
import './image.component.scss';

// Image
class ImageDetails extends React.Component {

  coponentDidMount() {
    this;
  }

  renderImage(image) {
    return (
      <div key={image.id} className='image-detail layout vertical justified'>
        <div className='layout horizontal justified'>
          <div className='flex ui fluid left corner labeled input'>
            <input type='text' name='name' defaultValue={image.name} placeholder='A unique image name' autoComplete='off' />
            <div className='ui left corner label'>
              <i className='file outline icon'/>
            </div>
          </div>
          <div className='flex layout horizontal end-justified'>
            <button className='ui active toggle compact button'>
              <i className='edit icon'/>Edit
            </button>
            <button className='ui compact button'>
              <i className='copy icon'/>Copy
            </button>
            <button className='ui compact red button'>
              <i className='trash icon'/>Remove
            </button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const images = this.props.images;
    return (
      <div className='docker images padded layout vertical'>
          {images && images.map(image => {
            return this.renderImage(image);
          })}
      </div>
    );
  }
}

ImageDetails.propTypes = {
  images: React.PropTypes.array
};

export default ImageDetails;
