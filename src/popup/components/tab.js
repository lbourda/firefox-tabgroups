import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

export default class Tab extends React.Component {
  constructor(props) {
    super(props);

    this.handleTabClick = this.handleTabClick.bind(this);
    this.handleTabDrag = this.handleTabDrag.bind(this);
    this.handleTabDragStart = this.handleTabDragStart.bind(this);
  }

  render() {
    let favicon = <img alt="" className="tab-icon" src={this.correctFavIcon(this.props.tab.icon)} />;

    let tabClasses = classNames({
      active: this.props.tab.active,
      tab: true
    });

    return (
      <li className={tabClasses}
          onClick={this.handleTabClick}
          onDrag={this.handleTabDrag}
          onDragStart={this.handleTabDragStart}
          draggable="true"
          >
        {favicon}
        <span className="tab-title">{this.props.tab.title}</span>
      </li>
    );
  }

  correctFavIcon(url) {
    if (!url)
      return "../icons/defaultFavicon.svg";
    if (url == "chrome://mozapps/skin/extensions/extensionGeneric-16.svg")
      return "../icons/extensionGeneric-16.svg";
    return url;
  }

  handleTabClick(event) {
    event.stopPropagation();

    let tab = this.props.tab;
    this.props.onTabClick(
      tab.group,
      tab.index
    );
  }

  handleTabDrag(event) {
    event.stopPropagation();

    let tab = this.props.tab;

    this.props.onTabDrag(
      tab.group,
      tab.index
    );
  }

  handleTabDragStart(event) {
    event.stopPropagation();

    let tab = this.props.tab;
    event.dataTransfer.setData("tab/index", tab.index);
    event.dataTransfer.setData("tab/group", tab.group);

    this.props.onTabDragStart(
      tab.group,
      tab.index
    );
  }
};

Tab.propTypes = {
  onTabClick: PropTypes.func,
  onTabDrag: PropTypes.func,
  onTabDragStart: PropTypes.func,
  tab: PropTypes.object.isRequired
};