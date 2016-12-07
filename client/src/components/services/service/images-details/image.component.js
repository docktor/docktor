// React
import React from 'react';

// Style
import './image.component.scss';

// Image
class ImageDetails extends React.Component {
  render() {
    const image = this.props.image;
    return (
      <tr className='image-detail'>
        <td>{image.name}</td>
        <td>
          <i className='copy link icon'></i>
          <i className='trash link icon'></i>
        </td>
      </tr>
    );
  }
}

ImageDetails.propTypes = {
  image: React.PropTypes.object
};

export default ImageDetails;
