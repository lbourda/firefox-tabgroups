import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

export default class GroupAddButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      draggingOverCounter: 0
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleGroupDragOver = this.handleGroupDragOver.bind(this);
    this.handleDragEnter = this.handleDragEnter.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
  }

  render() {
    let buttonClasses = classNames({
      draggingOver: this.state.draggingOverCounter !== 0,
      group: true
    });

    return (
      <li className={buttonClasses}
          onClick={this.handleClick}
          onDrop={this.handleDrop}
          onDragOver={this.handleGroupDragOver}
          onDragEnter={this.handleDragEnter}
          onDragLeave={this.handleDragLeave}
          >
        <span className="group-title">{browser.i18n.getMessage("popupAddGroup")}</span>
      </li>
    )
  }

  handleClick(event) {
    event.stopPropagation();
    this.props.onClick();
  }

  handleGroupDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  handleDragEnter(event) {
    event.stopPropagation();
    event.preventDefault();

    let draggingCounterValue = (this.state.draggingOverCounter == 1) ? 2 : 1;
    this.setState({draggingOverCounter: draggingCounterValue});
  }

  handleDragLeave(event) {
    event.stopPropagation();
    event.preventDefault();

    if (this.state.draggingOverCounter == 2) {
      this.setState({draggingOverCounter: 1});
    } else if (this.state.draggingOverCounter == 1) {
      this.setState({draggingOverCounter: 0});
    }
  }

  handleDrop(event) {
    event.stopPropagation();

    this.setState({draggingOverCounter: 0});

    let sourceGroup = event.dataTransfer.getData("tab/group");
    let tabIndex = event.dataTransfer.getData("tab/index");

    this.props.onDrop(
      sourceGroup,
      tabIndex
    );
  }
};

GroupAddButton.propTypes = {
  onClick: PropTypes.func,
  onDrop: PropTypes.func
};