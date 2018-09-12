import React from "react";
import PropTypes from "prop-types";

import Tab from "./tab.js";

export default class TabList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ul className="tab-list">
        {this.props.tabs.map((tab) =>
          <Tab
            key={tab.index}
            tab={tab}
            onTabClick={this.props.onTabClick}
            onTabDrag={this.props.onTabDrag}
            onTabDragStart={this.props.onTabDragStart}
          />
        )}
      </ul>
    );
  }
};

TabList.propTypes = {
  onTabClick: PropTypes.func,
  onTabDrag: PropTypes.func,
  onTabDragStart: PropTypes.func,
  tabs: PropTypes.array.isRequired
};