// import constants
import ModalConstants from './modal.constants.js';

// Close Modal
const closeModal = () => {
  return {
    type: ModalConstants.CLOSE_MODAL
  };
};

// New Site Modal
const openNewSiteModal = (position, callback) => {
  let form = { lines: [], hidden: [] };
  let line = { class: 'three', fields: [] };
  line.fields.push({ label: 'Title', name: 'title', placeholder: 'Site Title', type: 'text', required: true });
  line.fields.push({ label: 'Latitude', name: 'latitude', placeholder: 'Site Latitude', value: Math.round(position.lat * 10000) / 10000, type: 'number', required: true });
  line.fields.push({ label: 'Longitude', name: 'longitude', placeholder: 'Site Longitude', value: Math.round(position.lng * 10000) / 10000, type: 'number', required: true });
  form.lines.push(line);
  return {
    type: ModalConstants.OPEN_MODAL,
    title: 'New Site',
    form,
    callback
  };
};

// Edit Site Modal
const openEditSiteModal = (site, callback) => {
  let form = { lines: [], hidden: [] };
  let line = { class: 'three', fields: [] };
  line.fields.push({ label: 'Title', name: 'title', placeholder: 'Site Title', value: site.title, type: 'text', required: true });
  line.fields.push({ label: 'Latitude', name: 'latitude', placeholder: 'Site Latitude', value: site.latitude, type: 'number', required: true });
  line.fields.push({ label: 'Longitude', name: 'longitude', placeholder: 'Site Longitude', value: site.longitude, type: 'number', required: true });
  form.lines.push(line);

  form.hidden.push({ name: 'id', value: site.id });
  form.hidden.push({ name: 'created', value: site.created });
  return {
    type: ModalConstants.OPEN_MODAL,
    title: 'Edit Site',
    form,
    callback
  };
};

// ## Tag modal actions

const tagRightsHelp = `<div>
    Rights defines who is able to add or remove the tag <b>from groups or containers</b>, depending on his role. Be aware that only admins are able to create or delete tags on Docktor.
    <hr>
    For example :
    <ul>
    <li>a user who is classical user can only add or remove a tag with 'user' role</li>
    <li>a user who is supervisor can only add or remove a tag with 'user' or 'supervisor' role</li>
    <li>a user who is admin can add or remove every type of tag</li>
    </ul>
    </div>`;

const openNewTagsModal = (availableRights, availableCategories, callback) => {
  let form = { lines: [], hidden: [] };
  let firstLine = { fields: [] };
  firstLine.fields.push({ label: 'Tag names', name: 'tags', placeholder: 'Add some tags', type: 'tags', required: true, class: 'sixteen wide' });
  form.lines.push(firstLine);
  let secondLine = { class: 'two', fields: [] };
  secondLine.fields.push({ label: 'Category', name: 'category', placeholder: 'Choose category', type: 'autocomplete', options: availableCategories, required: true });
  secondLine.fields.push({ label: 'Default rights', name: 'rights', placeholder: 'Select the role', help: tagRightsHelp, type: 'dropdown', options: availableRights, required: true });
  form.lines.push(secondLine);
  return {
    type: ModalConstants.OPEN_MODAL,
    title: 'New Tags',
    form,
    callback
  };
};

const openEditTagModal = (tag, availableRights, availableCategories, callback) => {
  let form = { lines: [], hidden: [] };
  let line = { class: 'three', fields: [] };
  line.fields.push({ label: 'Name', name: 'name', placeholder: 'Fill a name', value: tag.name.raw, type: 'text', required: true });
  line.fields.push({ label: 'Category', name: 'category', placeholder: 'Set a category', value: tag.category.raw, type: 'autocomplete', options: availableCategories, required: true });
  line.fields.push({ label: 'Rights', name: 'rights', placeholder: 'Select the role', help: tagRightsHelp, value: tag.usageRights, type: 'dropdown', options: availableRights, required: true });
  form.lines.push(line);

  form.hidden.push({ name: 'id', value: tag.id });
  form.hidden.push({ name: 'created', value: tag.created });
  return {
    type: ModalConstants.OPEN_MODAL,
    title: 'Edit Tag',
    form,
    callback
  };
};

export default {
  closeModal,
  openNewSiteModal,
  openEditSiteModal,
  openNewTagsModal,
  openEditTagModal
};
