// React
import React from 'react';

import HeadingBox from './heading.box.component.js';

// VolumesBox listing a list of users
class VolumesBox extends React.Component {
  render() {
    return (
      <HeadingBox icon='large folder open icon' title='Volumes'>
        <p> blblbla</p>
      </HeadingBox>
    );
  }
};
VolumesBox.propTypes = {};

export default VolumesBox;

/*
<p>These volumes are used to have common volumes mapping on all services deployed on this daemon. You can add / remove / modify volumes mapping when you deploy a new service on a group.</p>
<div className='top-row'>
  <div className='field'>
    <label>Internal Volume</label>
  </div>
  <div className='field'>
    <label>Default Value</label>
  </div>
  <div className='field'>
    <label>Rights</label>
  </div>
  <div className='field'>
    <label>Description</label>
  </div>
  <div className='field'>
    <label>Remove</label>
  </div>
</div>
{this.renderVolumes(item)}
*/
