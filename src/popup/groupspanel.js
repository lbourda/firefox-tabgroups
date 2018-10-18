import React from "react";
import ReactDOM from "react-dom";
import { Provider as reduxProvider } from "react-redux";
import { createStore as reduxCreateStore } from "redux";

import ActionCreators from "./action_creators.js";
import Reducer from "./reducer.js"

const store = reduxCreateStore(Reducer);

browser.runtime.sendMessage({command: "UI:Refresh"});

import App from "./components/app.js"

const Actions = {
  addGroup: function() {
    browser.runtime.sendMessage({command: "Group:Add"});
  },

  addGroupWithTab: function(sourceGroupID, tabIndex) {
    browser.runtime.sendMessage({command: "Group:AddWithTab", data: {sourceGroupID: sourceGroupID, tabIndex: tabIndex}});
  },

  closeGroup: function(groupID) {
    browser.runtime.sendMessage({command: "Group:Close", data: {groupID: groupID}});
  },

  renameGroup: function(groupID, title) {
    browser.runtime.sendMessage({command: "Group:Rename", data: {groupID: groupID, title: title}});
  },

  selectGroup: function(groupID) {
    browser.runtime.sendMessage({command: "Group:Select", data: {groupID}});
  },

  moveTabToGroup: function(sourceGroupID, tabIndex, targetGroupID) {
    browser.runtime.sendMessage({command: "Group:Drop", data: {sourceGroupID: sourceGroupID, tabIndex: tabIndex, targetGroupID: targetGroupID}});
  },

  selectTab: function(groupID, tabIndex) {
    browser.runtime.sendMessage({command: "Tab:Select", data: {groupID: groupID, tabIndex: tabIndex}});
  },

  dragTab: function(groupID, tabIndex) {
    browser.runtime.sendMessage({command: "Tab:Drag", data: {groupID: groupID, tabIndex: tabIndex}});
  },

  dragTabStart: function(groupID, tabIndex) {
    browser.runtime.sendMessage({command: "Tab:DragStart", data: {groupID: groupID, tabIndex: tabIndex}});
  }
};

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(
    React.createElement(
      reduxProvider,
      {store},
      React.createElement(App, {
        onGroupAddClick: Actions.addGroup,
        onGroupAddDrop: Actions.addGroupWithTab,
        onGroupClick: Actions.selectGroup,
        onGroupDrop: Actions.moveTabToGroup,
        onGroupCloseClick: Actions.closeGroup,
        onGroupTitleChange: Actions.renameGroup,
        onTabClick: Actions.selectTab,
        onTabDrag: Actions.dragTab,
        onTabDragStart: Actions.dragTabStart
      })
    ),
    document.getElementById("content")
  );
});

browser.runtime.onMessage.addListener((message) => {
  switch (message.command) {
    case "Groups:Changed":
      store.dispatch(ActionCreators.setTabgroups(message.data.tabgroups));
      break;
    case "Groups:CloseTimeoutChanged":
      store.dispatch(ActionCreators.setGroupCloseTimeout(message.data.timeout));
      break;
  };
});
