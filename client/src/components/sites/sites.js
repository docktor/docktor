// React
import React from 'react'
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'
import { connect } from 'react-redux'
import { If, Then } from 'react-if'

// Actions for redux container
import { deleteSites } from '../../actions/sites.actions.js'

// Style
import 'semantic-ui-icon/icon.min.css'
import 'semantic-ui-loader/loader.min.css'
import 'semantic-ui-dimmer/dimmer.min.css'
import 'leaflet/dist/leaflet.css'
import './sites.scss'

//Site Component using react-leaflet
class Sites extends React.Component {
  constructor() {
    super()
    this.initPosition = {
      lat: 45,
      lng: 0,
      zoom: 5,
    }
  }

  handleClick(e) {
    console.dir(e)
  }

  render() {
    const initPosition = [this.initPosition.lat, this.initPosition.lng]
    const sites = this.props.sites.items
    const fetching = this.props.sites.isFetching
    const onDelete = this.props.onDelete
    return (
      <Map className="map" center={initPosition} zoom={this.initPosition.zoom} onClick={this.handleClick}>
        <If condition={fetching}>
          <Then>
            <div className="ui active dimmer">
              <div className="ui text loader">Fetching</div>
            </div>
          </Then>
        </If>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
          />
        {sites.map(site => {
          const sitePosition = [site.Latitude, site.Longitude]
          return (
            <Marker key={site.ID} position={sitePosition}>
              <Popup>
                <span>{site.Title} <i className="red trash icon"></i></span>
              </Popup>
            </Marker>
          )
        }) }
      </Map>
    )
  }
}

// Function to map state to container props
const mapStateToSitesProps = (state) => {
  return { sites: state.sites }
}

// Function to map dispatch to container props
const mapDispatchToSitesProps = (dispatch) => {
  return { onDelete: id => dispatch(deleteSites(id)) }
}

// Redux container to Sites component
const SiteMap = connect(
  mapStateToSitesProps,
  mapDispatchToSitesProps
)(Sites)

export default SiteMap;