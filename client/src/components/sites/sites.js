import React from 'react'
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'
import { connect } from 'react-redux'

import { deleteSites } from '../../actions/sites.actions.js'

import 'semantic-ui-icon/icon.min.css'
import 'leaflet/dist/leaflet.css'
import './sites.scss'

const mapStateToSitesProps = (state) => {
    return {
        sites: state.sites
    }
}

const mapDispatchToSitesProps = (dispatch) => {
    return {
        onDelete : (id) => {
            dispatch(deleteSites(id))
        }
    }
}


class Sites extends React.Component {
  constructor() {
    super();
    this.position = {
      lat: 45,
      lng: 0,
      zoom: 5,
    };
  }

  handleRightClick(e) {
    console.dir(e);
  }
  
  render() {
    const position = [this.position.lat, this.position.lng];
    const sites = this.props.sites.items;
    const onDelete = this.props.onDelete;
    return (
      <Map className="map" center={position} zoom={this.position.zoom} onClick={this.handleRightClick}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
        />
        {sites.map(function(site) {
          const sitePosition = [site.Latitude, site.Longitude]
          return (
            <Marker key={site.ID} position={sitePosition}>
              <Popup>
                <span>{site.Title} <i className="red trash icon"></i></span>
              </Popup>
            </Marker>
          );
        })}
      </Map>
    );
  }
}

const SiteMap = connect(
  mapStateToSitesProps,
  mapDispatchToSitesProps
)(Sites);

export default SiteMap;