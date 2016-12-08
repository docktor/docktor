// React
import React from 'react';

// Style
import './image.component.scss';

// Image
class ImageDetails extends React.Component {


  renderImage(image) {
    return [
      <tr className='image-detail'>
        <td>
          <div className='ui fluid input'>
            <input type='text' name='name' defaultValue={image.name} placeholder='A unique image name' autoComplete='off' />
          </div>
        </td>
        <td className='layout horizontal end-justified'>
          <button className='ui compact button'>
            <i className='edit icon'></i>Edit
          </button>
          <button className='ui compact button'>
            <i className='copy icon'></i>Copy
          </button>
          <button className='ui compact red button'>
            <i className='trash icon'></i>Remove
          </button>
        </td>
      </tr>,
      ''
    ];

  }

  render() {
    const images = this.props.images;
    return (
      <table className='ui fixed very basic very padded table'>
        <tbody>
          {images && images.map(image => {
            return this.renderImage(image);
          })}
        </tbody>
      </table>
    );
  }
}

ImageDetails.propTypes = {
  images: React.PropTypes.array
};

export default ImageDetails;
