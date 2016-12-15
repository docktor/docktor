// React
import React from 'react';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import DebounceInput from 'react-debounce-input';
import ReactDataGrid from 'react-data-grid';
import 'react-data-grid/dist/react-data-grid.css';
import { Editors, Formatters } from 'react-data-grid/addons';

// API Fetching
import TagsThunks from '../../modules/tags/tags.thunks.js';
import TagsActions from '../../modules/tags/tags.actions.js';


class SlugifiedDataEditor extends Editors.SimpleTextEditor {
  render() {
    return (<input ref='input' type='text' onBlur={this.props.onBlur} className='form-control' defaultValue={this.props.value.raw} />);
  }
}

SlugifiedDataEditor.propTypes = {
  value: React.PropTypes.object
};

class SlugifiedDataFormatter extends React.Component {
  render() {
    var rawName = this.props.value.raw;
    var slugifiedName = this.props.value.slug;
    return (
      <div id={slugifiedName}>{rawName}</div>);
  }
}

SlugifiedDataFormatter.propTypes = {
  value: React.PropTypes.object
};

class CategoryEditor extends Editors.AutoComplete {
  render() {
    return (
      <select style={this.getStyle()} defaultValue={this.props.value} onBlur={this.props.onBlur} onChange={this.onChange} >
        {this.renderOptions()}
      </select>);
  }

  renderOptions() {
    let options = [];
    this.props.getCategories().forEach(function (category) {
      options.push(<option key={category.id} value={category.slug} title={category.raw} >{category.raw}</option>);
    }, this);
    return options;
  }
}

CategoryEditor.propTypes = {
  getCategories: React.PropTypes.function
};

//Tags Component
class Tags extends React.Component {

  constructor() {
    super();

    // Formatter and editor for usage rights dropdown
    var usageRoles = [
      { id: 'supervisor', value: 'supervisor', text: 'Supervisor', title: 'Supervisor' },
      { id: 'admin', value: 'admin', text: 'Admin', title: 'Admin' },
      { id: 'user', value: 'user', text: 'User', title: 'User' }
    ];
    this.UsageRightsEditor = <Editors.DropDownEditor options={usageRoles} />;
    this.UsageRightsFormatter = <Formatters.DropDownFormatter value='usageRights' options={usageRoles} />;
  }

  columns() {
    // Formatter for categories
    var categories = this.getCategories();
    var CategoryEdit = <Editors.AutoCompleteEditor options={categories} />;
    return [
      {
        key: 'name',
        name: 'Tag',
        editable: true,
        formatter: SlugifiedDataFormatter,
        editor: SlugifiedDataEditor
      },
      {
        key: 'category',
        name: 'Category',
        editable: true,
        formatter: SlugifiedDataFormatter,
        editor: CategoryEdit
      },
      {
        key: 'usageRights',
        name: 'Usage Rights',
        formatter: this.UsageRightsFormatter,
        editor: this.UsageRightsEditor
      }
    ];
  }

  getCategories() {
    return Array.from(
      new Set(
        this.props.tags.map(tag => ({ id: tag.category.slug, title: tag.category.raw }))
      )
    );
  }

  rowGetter(rowIdx) {
    return this.props.tags[rowIdx];
  }

  handleRowUpdated(e) {
    //merge updated row with current row and rerender by setting state
    console.log('Update row');
    //Object.assign(rows[e.rowIdx], e.updated);
    //this.setState({ rows: rows });
  }

  componentWillMount() {
    this.props.fetchTags();
  }

  /*
            {tags.map(tag => {
            return (
              <div>{tag.name.raw}</div>
            );
          })} */
  render() {
    const tags = this.props.tags;
    const isFetching = this.props.isFetching;
    return (
      <div>
        {isFetching ?
          <div className='flex ui active inverted dimmer'>
            <div className='ui text loader'>Fetching</div>
          </div>
          : ''
        }
        <div className='flex layout horizontal center-center wrap '>
          <ReactDataGrid
            enableCellSelect={true}
            columns={this.columns()}
            rowGetter={(rowIdx) => this.rowGetter(rowIdx)}
            rowsCount={tags.length}
            minHeight={500}
            onRowUpdated={this.handleRowUpdated}
            />
        </div>
      </div>
    );

  }
}
Tags.propTypes = {
  tags: React.PropTypes.array,
  isFetching: React.PropTypes.bool,
  fetchTags: React.PropTypes.func.isRequired
};

// Function to map state to container props
const mapStateToProps = (state) => {
  const tags = Object.values(state.tags.items);
  const isFetching = state.tags.isFetching;
  return { tags, isFetching };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    fetchTags: () => {
      dispatch(TagsThunks.fetchIfNeeded());
    }
  };
};

// Redux container to Sites component
const TagsPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(Tags);

export default TagsPage;
