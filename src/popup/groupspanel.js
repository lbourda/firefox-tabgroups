import React from "react";
import ReactDOM from "react-dom";
import { Provider as reduxProvider } from "react-redux";
import { createStore as reduxCreateStore } from "redux";

import ActionCreators from "./action_creators.js";
import Reducer from "./reducer.js"

const store = reduxCreateStore(Reducer);

var portGroupsPanel = browser.runtime.connect({name: "groups-panel"});
portGroupsPanel.postMessage({type: "UI:Refresh"});

import App from "./components/app.js"

const Actions = {
  addGroup: function() {
    portGroupsPanel.postMessage({type: "Group:Add"});
  },

  addGroupWithTab: function(sourceGroupID, tabIndex) {
    portGroupsPanel.postMessage({type: "Group:AddWithTab", data: {sourceGroupID: sourceGroupID, tabIndex: tabIndex}});
  },

  closeGroup: function(groupID) {
    portGroupsPanel.postMessage({type: "Group:Close", data: {groupID: groupID}});
  },

  renameGroup: function(groupID, title) {
    portGroupsPanel.postMessage({type: "Group:Rename", data: {groupID: groupID, title: title}});
  },

  selectGroup: function(groupID) {
    portGroupsPanel.postMessage({type: "Group:Select", data: {groupID}});
  },

  moveTabToGroup: function(sourceGroupID, tabIndex, targetGroupID) {
    portGroupsPanel.postMessage({type: "Group:Drop", data: {sourceGroupID: sourceGroupID, tabIndex: tabIndex, targetGroupID: targetGroupID}});
  },

  selectTab: function(groupID, tabIndex) {
    portGroupsPanel.postMessage({type: "Tab:Select", data: {groupID: groupID, tabIndex: tabIndex}});
  },

  dragTab: function(groupID, tabIndex) {
    portGroupsPanel.postMessage({type: "Tab:Drag", data: {groupID: groupID, tabIndex: tabIndex}});
  },

  dragTabStart: function(groupID, tabIndex) {
    portGroupsPanel.postMessage({type: "Tab:DragStart", data: {groupID: groupID, tabIndex: tabIndex}});
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

portGroupsPanel.onMessage.addListener((request, sender, senderMessage) => {
  switch (request.type) {
    case "Groups:Changed":
      store.dispatch(ActionCreators.setTabgroups(request.data.tabgroups));
      break;
    case "Groups:CloseTimeoutChanged":
      store.dispatch(ActionCreators.setGroupCloseTimeout(request.data.timeout));
      break;
  };
});