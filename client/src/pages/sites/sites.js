// React
import React from 'react'
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'
import { connect } from 'react-redux'
import { If, Then } from 'react-if'

// Actions for redux container
import { deleteSite, saveSite } from '../../actions/thunks/sites.thunks.js'
import { confirmDeletion } from '../../actions/toasts.actions.js'
import { openNewSiteModal, openEditSiteModal } from '../../actions/modal.actions.js'

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
    this.initPosition = { lat: 45, lng: 0, zoom: 5 }
  }

  openModalNewSite(onCreate) {
    return e => {
      onCreate(e.latlng)
    }
  }

  openModalEditSite(onEdit, site) {
    return () => {
      onEdit(site)
    }
  }

  render() {
    const initPosition = [this.initPosition.lat, this.initPosition.lng]
    const sites = Object.values(this.props.sites.items)
    const fetching = this.props.sites.isFetching
    const onDelete = this.props.onDelete
    const onCreate = this.props.onCreate
    const onEdit = this.props.onEdit
    return (
      <Map className="map" center={initPosition} zoom={this.initPosition.zoom} onClick={this.openModalNewSite(onCreate)}>
        <If condition={fetching}>
          <Then>
            <div className="ui active inverted dimmer">
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
                <span>{site.Title}{' '}
                  <a onClick={this.openModalEditSite(onEdit, site)}><i className="red edit icon"></i></a>
                  <a onClick={() => onDelete(site)}><i className="red trash icon"></i></a>
                </span>
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
  return {
    onDelete: site => {
      const callback = () => dispatch(deleteSite(site.ID))
      dispatch(confirmDeletion(site.Title, callback))
    },
    onCreate: position => {
      const callback = (siteForm) => dispatch(saveSite(siteForm))
      dispatch(openNewSiteModal(position, callback))
    },
    onEdit: site => {
      const callback = (siteForm) => dispatch(saveSite(siteForm))
      dispatch(openEditSiteModal(site, callback))
    }
  }
}

// Redux container to Sites component
const SitePage = connect(
  mapStateToSitesProps,
  mapDispatchToSitesProps
)(Sites)

export default SitePage;