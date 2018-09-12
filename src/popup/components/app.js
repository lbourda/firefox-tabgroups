import React from "react";
import PropTypes from "prop-types";

import GroupList from "./grouplist.js";

export default class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <GroupList {...this.props}/>;
  }
};

App.propTypes = {
  onGroupAddClick: PropTypes.func,
  onGroupAddDrop: PropTypes.func,
  onGroupClick: PropTypes.func,
  onGroupDrop: PropTypes.func,
  onGroupCloseClick: PropTypes.func,
  onGroupTitleChange: PropTypes.func,
  onTabClick: PropTypes.func,
  onTabDrag: PropTypes.func,
  onTabDragStart: PropTypes.func,
};