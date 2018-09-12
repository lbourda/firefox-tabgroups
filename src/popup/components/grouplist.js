import React from "react";
import PropTypes from "prop-types";
import { connect as reduxConnect } from "react-redux";

import Group from "./group.js";
import GroupAddButton from "./groupaddbutton.js";
import ActionCreators from "../action_creators.js";

const GroupList = (() => {
  class GroupListStandalone extends React.Component {
    render() {
      return (
        <ul className="group-list">
          {this.props.groups.map((group) =>
            <Group
              key={group.id}
              group={group}
              closeTimeout={this.props.closeTimeout}
              onGroupClick={this.props.onGroupClick}
              onGroupDrop={this.props.onGroupDrop}
              onGroupCloseClick={this.props.onGroupCloseClick}
              onGroupTitleChange={this.props.onGroupTitleChange}
              onTabClick={this.props.onTabClick}
              onTabDrag={this.props.onTabDrag}
              onTabDragStart={this.props.onTabDragStart}
              />
          )}
          <GroupAddButton
            onClick={this.props.onGroupAddClick}
            onDrop={this.props.onGroupAddDrop}
            />
        </ul>
      );
    }
  };

  GroupListStandalone.propTypes = {
    groups: PropTypes.object.isRequired,
    closeTimeout: PropTypes.number,
    onGroupAddClick: PropTypes.func,
    onGroupAddDrop: PropTypes.func,
    onGroupClick: PropTypes.func,
    onGroupDrop: PropTypes.func,
    onGroupCloseClick: PropTypes.func,
    onGroupTitleChange: PropTypes.func,
    onTabClick: PropTypes.func,
    onTabDrag: PropTypes.func,
    onTabDragStart: PropTypes.func
  };

  return reduxConnect(function(state) {
    return {
      groups: state.get("tabgroups"),
      closeTimeout: state.get("closeTimeout")
    };
  }, ActionCreators)(GroupListStandalone);
})();

export { GroupList as default };