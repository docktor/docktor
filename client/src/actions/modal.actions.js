// Close Modal
export const CLOSE_MODAL = 'CLOSE_MODAL'

export function closeModal() {
  return {
    type: CLOSE_MODAL
  }
}

// Site Modal
export const OPEN_MODAL = 'OPEN_MODAL'

export function openNewSiteModal(position, callback) {
  let form = { lines: [], hidden: [] }
  let line = { class: "three", fields: [] }
  line.fields.push({ name: "Title", desc: "Site Title", type: "text", required: true })
  line.fields.push({ name: "Latitude", desc: "Site Latitude", value: Math.round(position.lat * 100) / 100, type: "number", required: true })
  line.fields.push({ name: "Longitude", desc: "Site Longitude", value: Math.round(position.lng * 100) / 100, type: "number", required: true })
  form.lines.push(line)
  return {
    type: OPEN_MODAL,
    title: "New Site",
    form,
    callback
  }
}

export function openEditSiteModal(site, callback) {
 let form = { lines: [], hidden: [] }
  let line = { class: "three", fields: [] }
  line.fields.push({ name: "Title", desc: "Site Title", value: site.Title, type: "text", required: true })
  line.fields.push({ name: "Latitude", desc: "Site Latitude", value: site.Latitude, type: "number", required: true })
  line.fields.push({ name: "Longitude", desc: "Site Longitude", value: site.Longitude, type: "number", required: true })
  form.lines.push(line)

  form.hidden.push({ name: "ID", value: site.ID })
  form.hidden.push({ name: "Created", value: site.Created })
  return {
    type: OPEN_MODAL,
    title: "Edit Site",
    form,
    callback
  }
}