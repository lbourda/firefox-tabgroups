import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

export default class GroupControls extends React.Component {
  constructor(props) {
    super(props);
  }

  getEditControls() {
    let controls;
    if (this.props.editing) {
      controls = [
        <i className="group-edit fa fa-fw fa-check" onClick={this.props.onEditSave} />
        ,
        <i className="group-edit fa fa-fw fa-ban" onClick={this.props.onEditAbort} />
      ];
    } else {
      controls = [ <i className="group-edit fa fa-fw fa-pencil" onClick={this.props.onEdit} /> ];
    }

    return controls;
  }

  getClosingControls() {
    return [ <i className="group-close-undo fa fa-fw fa-undo" onClick={this.props.onUndoCloseClick} /> ];
  }

  render() {
    let groupControls;
    if (this.props.closing) {
      groupControls = this.getClosingControls();
    } else {
      groupControls = this.getEditControls();
    }
  
    let expanderClasses = classNames({
      "group-expand": true,
      "fa": true,
      "fa-fw": true,
      "fa-chevron-down": !this.props.expanded,
      "fa-chevron-up": this.props.expanded
    });

    return (
      <span className="group-controls">
        {groupControls}
        <i className="group-close fa fa-fw fa-times" onClick={(e) => this.props.onClose(e)} />
        <i className={expanderClasses} onClick={this.props.onExpand} />
      </span>
    );
  }
};

GroupControls.propTypes = {
  expanded: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onEdit: PropTypes.func,
  onEditAbort: PropTypes.func,
  onEditSave: PropTypes.func,
  onExpand: PropTypes.func,
  onUndoCloseClick: PropTypes.func
};