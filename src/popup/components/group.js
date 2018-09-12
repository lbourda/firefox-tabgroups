import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import GroupControls from "./groupcontrols.js";
import TabList from "./tablist.js";

export default class Group extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      closing: false,
      editing: false,
      expanded: false,
      draggingOverCounter: 0,
      dragSourceGroup: false,
      newTitle: this.getTitle()
    };

    this.handleGroupCloseClick = this.handleGroupCloseClick.bind(this);
    this.handleGroupClick = this.handleGroupClick.bind(this);
    this.handleGroupEditClick = this.handleGroupEditClick.bind(this);
    this.handleGroupEditAbortClick = this.handleGroupEditAbortClick.bind(this);
    this.handleGroupEditSaveClick = this.handleGroupEditSaveClick.bind(this);
    this.handleGroupExpandClick = this.handleGroupExpandClick.bind(this);
    this.handleGroupTitleInputKey = this.handleGroupTitleInputKey.bind(this);
    this.handleGroupDrop = this.handleGroupDrop.bind(this);
    this.handleGroupDragOver = this.handleGroupDragOver.bind(this);
    this.handleGroupDragEnter = this.handleGroupDragEnter.bind(this);
    this.handleGroupDragLeave = this.handleGroupDragLeave.bind(this);
    this.handleGroupCloseAbortClick = this.handleGroupCloseAbortClick.bind(this);
    }

  getTitle() {
    return this.props.group.title || (
      browser.i18n.getMessage("popupUnnamedGroup") + " " + this.props.group.id
    );
  }

  render() {
    let titleElement;
    if (this.state.editing) {
      titleElement = (
        <input type="text"
              defaultValue={this.getTitle()}
              onChange={(event) => {
                this.setState({newTitle: event.target.value});
              }}
              onClick={(event) => {
                event.stopPropagation();
              }}
              onKeyUp={this.handleGroupTitleInputKey}
          />
      );
    } else {
      titleElement = <span>{this.getTitle()}</span>;
    }

    let groupClasses = classNames({
      active: this.props.group.active,
      editing: this.state.editing,
      closing: this.state.closing,
      draggingOver: this.state.draggingOverCounter !== 0,
      dragSourceGroup: this.state.dragSourceGroup,
      expanded: this.state.expanded,
      group: true
    });

    return (
      <li className={groupClasses}
          onClick={this.handleGroupClick}
          onDragOver={this.handleGroupDragOver}
          onDragEnter={this.handleGroupDragEnter}
          onDragLeave={this.handleGroupDragLeave}
          onDrop={this.handleGroupDrop}
          >
        <span className="group-title">
          {titleElement}
          <GroupControls
            closing={this.state.closing}
            editing={this.state.editing}
            expanded={this.state.expanded}
            onClose={this.handleGroupCloseClick}
            onEdit={this.handleGroupEditClick}
            onEditAbort={this.handleGroupEditAbortClick}
            onEditSave={this.handleGroupEditSaveClick}
            onExpand={this.handleGroupExpandClick}
            onUndoCloseClick={this.handleGroupCloseAbortClick}
            />
        </span>
        {this.state.expanded &&
          <TabList
            tabs={this.props.group.tabs}
            onTabClick={this.props.onTabClick}
            onTabDrag={this.props.onTabDrag}
            onTabDragStart={this.props.onTabDragStart}
            onTabDragEnd={this.props.onTabDragEnd}
          />
        }
      </li>
    );
  }

  handleGroupCloseClick(event) {
    event.stopPropagation();
    this.setState({editing: false});
    this.setState({closing: true});

    let _this = this;

    if (_this.props.closeTimeout == 0) {
      _this.props.onGroupCloseClick(_this.props.group.id);
      return;
    }

    _this.timer = setTimeout(function() {
      _this.props.onGroupCloseClick(_this.props.group.id);
    }, _this.props.closeTimeout * 1000);
  }

  handleGroupClick(event) {
    event.stopPropagation();
    this.props.onGroupClick(this.props.group.id);
  }

  handleGroupEditClick(event) {
    event.stopPropagation();
    this.setState({editing: !this.state.editing});
  }

  handleGroupEditAbortClick(event) {
    event.stopPropagation();
    this.setState({editing: false});
  }

  handleGroupEditSaveClick(event) {
    event.stopPropagation();
    this.setState({editing: false});
    this.props.onGroupTitleChange(this.props.group.id, this.state.newTitle);
  }

  handleGroupExpandClick(event) {
    event.stopPropagation();
    this.setState({expanded: !this.state.expanded});
  }

  handleGroupTitleInputKey(event) {
    if (event.keyCode == 13) {
      this.setState({editing: false});
      this.props.onGroupTitleChange(this.props.group.id, this.state.newTitle);
    }
  }

  handleGroupDrop(event) {
    event.stopPropagation();

    this.setState({draggingOverCounter: 0});

    let sourceGroup = event.dataTransfer.getData("tab/group");
    let tabIndex = event.dataTransfer.getData("tab/index");

    this.props.onGroupDrop(sourceGroup, tabIndex, this.props.group.id);
  }

  handleGroupDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
    return false;
  }

  handleGroupDragEnter(event) {
    event.stopPropagation();
    event.preventDefault();

    if (event.dataTransfer == null) {
      return;
    }

    let sourceGroupID = event.dataTransfer.getData("tab/group");
    let isSourceGroup = sourceGroupID == this.props.group.id;
    this.setState({dragSourceGroup: isSourceGroup});

    let draggingCounterValue = (this.state.draggingOverCounter == 1) ? 2 : 1;
    this.setState({draggingOverCounter: draggingCounterValue});
  }

  handleGroupDragLeave(event) {
    event.stopPropagation();
    event.preventDefault();

    if (this.state.draggingOverCounter == 2) {
      this.setState({draggingOverCounter: 1});
    } else if (this.state.draggingOverCounter == 1) {
      this.setState({draggingOverCounter: 0});
    }

    return false;
  }

  handleGroupCloseAbortClick(event) {
    event.stopPropagation();

    clearTimeout(this.timer);
    this.setState({closing: false});
  }
};

Group.propTypes = {
  closeTimeout: PropTypes.number,
  group: PropTypes.object.isRequired,
  onGroupClick: PropTypes.func,
  onGroupDrop: PropTypes.func,
  onGroupCloseClick: PropTypes.func,
  onGroupTitleChange: PropTypes.func,
  onTabClick: PropTypes.func,
  onTabDrag: PropTypes.func,
  onTabDragStart: PropTypes.func,
};