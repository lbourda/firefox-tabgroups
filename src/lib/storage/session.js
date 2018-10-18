function SessionStorage() {
}

SessionStorage.prototype = {
  /**
   * Returns an array of available groups.
   *
   * @param {ActiveInfo} activeInfo
   * @returns {Array}
   */
  getGroups: async function(activeInfo) {
    let groupsData = await this._getGroupsData(activeInfo);
    let currentGroup = await this._getCurrentGroupData(activeInfo);

    if (Object.keys(groupsData).length == 0) {
      await this.addGroup(activeInfo);
      groupsData = await this._getGroupsData(activeInfo);
    }

    let groups = [];
    for (let groupIndex in groupsData) {
      let group = groupsData[groupIndex];

      groups.push({
        active: group.id == currentGroup.activeGroupId,
        id: group.id,
        title: group.title,
        selectedIndex: group.selectedIndex
      });
    }

    return groups;
  },

  /**
   * Returns all tabs.
   *
   * @param {ActiveInfo} activeInfo
   * @returns {Array}
   */
  getTabs: async function(activeInfo) {
    let tabs = [];

    let currentGroupID = await this.getCurrentGroupID(activeInfo);
    const tabs_ = await browser.tabs.query({windowId: activeInfo.windowId});
    for (let tab of tabs_) {
      let tabData = await this._getTabData(tab);

      if (tab.pinned) {
        continue;
      }

      let groupID = currentGroupID;
      if (tabData && tabData.groupID) {
        groupID = tabData.groupID;
      } else {
        await this.setTabGroup(tab, groupID);
      }

      tabs.push({
        active: tab.active,
        group: groupID,
        icon: tab.favIconUrl,
        index: tab.index,
        title: tab.title
      });
    }

    return tabs;
  },

  /**
   * Returns all tab ids in the specified group.
   *
   * @param {Number} groupID
   * @returns {Array}
   */
  getTabIdsByGroup: async function(targetGroupID) {
    let tabids = [];

    const tabs_ = await browser.tabs.query({});
    for (let tab of tabs_) {
      let tabData = await this._getTabData(tab);

      let group = 0;
      if (tabData && tabData.groupID) {
        group = tabData.groupID;
      }

      if (tab.pinned || group != targetGroupID) {
        continue;
      }

      tabids.push(tab.id);
    }

    return tabids;
  },

  /**
   * Returns all tab ids in groups other than the one specified.
   *
   * @param {Number} groupID
   * @returns {Array}
   */
  getTabIdsByOtherGroups: async function(targetGroupID) {
    let tabids = [];

    const tabs_ = await browser.tabs.query({});
    for (let tab of tabs_) {
      let tabData = await this._getTabData(tab);

      let group = 0;
      if (tabData && tabData.groupID) {
        group = tabData.groupID;
      }

      if (tab.pinned || group == targetGroupID) {
        continue;
      }

      tabids.push(tab.id);
    }

    return tabids;
  },

  /**
   * Returns the ID of the current group.
   *
   * @param {ActiveInfo} activeInfo
   * @returns {Number}
   */
  getCurrentGroupID: async function(activeInfo) {
    let groupData = await this._getCurrentGroupData(activeInfo);
    return groupData.activeGroupId || 0;
  },

  /**
   * Returns the ID of the current group.
   *
   * @param {ActiveInfo} activeInfo
   * @param {Number} groupID
   */
  setCurrentGroup: async function(activeInfo, groupID) {
    let groupData = await this._getCurrentGroupData(activeInfo);
    groupData.activeGroupId = groupID;
    await this._setCurrentGroupData(activeInfo, groupData);
  },

  /**
   * Assigns a tab to a group.
   *
   * @param {XULElement} tab
   * @param {Number} groupID
   */
  setTabGroup: async function(tab, groupID) {
    await this._setTabData(
      tab,
      Object.assign({}, await this._getTabData(tab), {groupID})
    );
  },

  /**
   * Returns the next possible GroupID.
   *
   * @param {ActiveInfo} activeInfo
   * @returns {Number}
   */
  getNextGroupID: async function(activeInfo) {
    let groupData = await this._getCurrentGroupData(activeInfo);
    let id = groupData.nextID;
    groupData.nextID++;
    await this._setCurrentGroupData(activeInfo, groupData);
    return id;
  },

  /**
   * Creates a new tab group.
   *
   * @param {ActiveInfo} activeInfo
   * @param {String} title - defaults to an empty string
   */
  addGroup: async function(activeInfo, title = "") {
    let groups = await this._getGroupsData(activeInfo);
    let groupID = await this.getNextGroupID(activeInfo);
    groups[groupID] = {
      id: groupID,
      title: title,
      selectedIndex: 0
    };

    let currentGroups = await this._getCurrentGroupData(activeInfo);
    currentGroups.totalNumber++;

    await this._setGroupsData(activeInfo, groups);
    await this._setCurrentGroupData(activeInfo, currentGroups);
  },

  /**
   * Removes tabs from a specified group.
   *
   * @param {Number} groupID
   */
  removeGroupTabs: async function(groupID) {
    let tabsToRemove = [];

    const tabs_ = await browser.tabs.query({});
    for (let tab of tabs_) {
      let tabData = await this._getTabData(tab);

      if (tabData && tabData.groupID && tabData.groupID == groupID) {
        tabsToRemove.push(tab.id);
      }
    }

    await browser.tabs.remove(tabsToRemove);
  },

  /**
   * Removes a tab group from the storage.
   *
   * @param {ActiveInfo} activeInfo
   * @param {Number} groupID
   */
  removeGroup: async function(activeInfo, groupID) {
    let groups = await this._getGroupsData(activeInfo);
    delete groups[groupID];

    let currentGroups = await this._getCurrentGroupData(activeInfo);
    currentGroups.totalNumber -= 1;

    await this._setGroupsData(activeInfo, groups);
    await this._setCurrentGroupData(activeInfo, currentGroups);
  },

  /**
   * Renames a group.
   *
   * @param {ActiveInfo} activeInfo
   * @param {Number} groupID - the groupID
   * @param {String} title - the new title
   */
  renameGroup: async function(activeInfo, groupID, title) {
    let groupsData = await this._getGroupsData(activeInfo);
    groupsData[groupID].title = title;
    await this._setGroupsData(activeInfo, groupsData);
  },

  /**
   * Get the selected tab index for a group.
   *
   * @param {ActiveInfo} activeInfo
   * @param {Number} groupID - the groupID
   */
  getGroupSelectedIndex: async function(activeInfo, groupID) {
    let groupsData = await this._getGroupsData(activeInfo);
    let currentGroup = groupsData[groupID];
    return currentGroup == null ? 0 : currentGroup.selectedIndex;
  },

  /**
   * Set the selected tab index for a group.
   *
   * @param {ActiveInfo} activeInfo
   * @param {Number} groupID - the groupID
   * @param {Number} index - the new selected index
   */
  setGroupSelectedIndex: async function(activeInfo, groupID, index) {
    let groupsData = await this._getGroupsData(activeInfo);
    let currentGroup = groupsData[groupID];
    if (currentGroup) {
      currentGroup.selectedIndex = index;
      await this._setGroupsData(activeInfo, groupsData);
    }
  },

  /**
   * Returns the data for a tab.
   *
   * @param {XULElement} tab
   * @returns {Object}
   */
  _getTabData: async function(tab) {
    return this._parseOptionalJson(
      await browser.sessions.getTabValue(tab.id, "tabview-tab").catch((e) => {})
    );
  },

  /**
   * Stores the data for a tab.
   *
   * @param {XULElement} tab
   * @param {Object} data
   * @returns {Object}
   */
  _setTabData: async function(tab, data) {
    await browser.sessions.setTabValue(tab.id, "tabview-tab", JSON.stringify(data)).catch((e) => {});
  },

  /**
   * Returns all tab groups with additional information.
   *
   * @param {ActiveInfo} activeInfo
   * @returns {Object}
   */
  _getGroupsData: async function(activeInfo) {
    return this._parseOptionalJson(
      await browser.sessions.getWindowValue(activeInfo.windowId, "tabview-group").catch((e) => {})
    );
  },

  /**
   * Set group information for the given window.
   *
   * @param {ActiveInfo} activeInfo
   * @param {Object} data
   * @returns {Object}
   */
  _setGroupsData: async function(activeInfo, data) {
    await browser.sessions.setWindowValue(activeInfo.windowId, "tabview-group", JSON.stringify(data)).catch((e) => {});
  },

  /**
   * Returns the current group as well as the next group ID and the total
   * number of groups.
   *
   * @param {ActiveInfo} activeInfo
   * @returns {Object}
   */
  _getCurrentGroupData: async function(activeInfo) {
    let data = this._parseOptionalJson(
      await browser.sessions.getWindowValue(activeInfo.windowId, "tabview-groups").catch((e) => {})
    );

    if (Object.keys(data).length == 0) {
      data = {
        activeGroupId: 1,
        nextID: 1,
        totalNumber: 0
      };
    }

    return data;
  },

  /**
   * Stores information about the current session.
   *
   * @param {ActiveInfo} activeInfo
   * @param {Object} data
   * @returns {Object}
   */
  _setCurrentGroupData: async function(activeInfo, data) {
    await browser.sessions.setWindowValue(activeInfo.windowId, "tabview-groups", JSON.stringify(data)).catch((e) => {});
  },

  /**
   * Safely parses a JSON string.
   *
   * @param {String} jsonString - JSON encoded data
   * @returns {Object} decoded JSON data or an empty object if something failed
   */
  _parseOptionalJson: function(jsonString) {
    if (jsonString) {
      try {
        return JSON.parse(jsonString);
      } catch (e) {
        return {};
      }
    }
    return {};
  }
};

export { SessionStorage as default };