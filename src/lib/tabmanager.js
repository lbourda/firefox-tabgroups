
function TabManager(storage) {
  this._storage = storage;
}

TabManager.prototype = {
  /**
   * Returns all groups with their tabs.
   *
   * @param {ActiveInfo} activeInfo
   * @returns {Object}
   */
  getGroupsWithTabs: async function(activeInfo, sort) {
    let groups = await this._storage.getGroups(activeInfo);
    let tabs = await this._storage.getTabs(activeInfo);

    let retGroups = groups.map((group) => {
      return Object.assign({}, group, {
        tabs: tabs.filter((tab) => {
          return tab.group == group.id;
        })
      });
    });

    if (sort) {
      retGroups.sort((a, b) => {
        // Unnamed groups
        if (a.title == "" && b.title == "") {
          return a.id - b.id;
        } else if (a.title == "") {
          return 1;
        } else if (b.title == "") {
          return -1;
        }

        // Normal cases
        if (a.title.toLowerCase() == b.title.toLowerCase()) {
          return 0;
        }

        return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
      });
    }

    return retGroups;
  },

  /**
   * Selects a given tab.
   *
   * @param {ActiveInfo} activeInfo
   * @param {Number} index - the tabs index
   * @param {Number} groupID - the tabs groupID
   */
  selectTab: async function(activeInfo, index, groupID) {
    let currentGroupId = await this._storage.getCurrentGroupID(activeInfo);

    if (currentGroupId == groupID) {
      let tab = (await browser.tabs.query({index: index}))[0];
      await browser.tabs.update(tab.id, {active: true});
    } else {
      await this.selectGroup(activeInfo, groupID, index);
    }
  },

  /**
   * Move tab beetwen groups
   *
   * @param {ActiveInfo} activeInfo
   * @param {Number} tabIndex - the tabs index
   * @param {Number} targetGroupID - target groupID (where to move tab)
   */
  moveTabToGroup: async function(activeInfo, tabIndex_, targetGroupID) {
    let tabIndex = (typeof tabIndex_ == "string") ? parseInt(tabIndex_) : tabIndex_;
    let tab = (await browser.tabs.query({index: tabIndex}))[0];
    if (tab.groupID == targetGroupID) {
      return;
    }
    await this._storage.setTabGroup(tab, targetGroupID);
    if (tab.selected) {
      await this.selectGroup(activeInfo, targetGroupID);
    }
  },

  /**
   * Selects a given group.
   *
   * @param {ActiveInfo} activeInfo
   * @param {Number} groupID - the groupID
   * @param {Number} tabIndex - the tab to activate
   */
  selectGroup: async function(activeInfo, groupID, tabIndex = 0) {
    let currentGroupID = await this._storage.getCurrentGroupID(activeInfo);
    if (currentGroupID == groupID) {
      return;
    }

    await this.updateCurrentSelectedTab(activeInfo);

    let lastSelected = await this._storage.getGroupSelectedIndex(activeInfo, groupID);
    let tabids = await this._storage.getTabIdsByGroup(groupID);
    let tabidsothers = await this._storage.getTabIdsByOtherGroups(groupID);

    let selectedTab;
    if (tabids.length == 0) {
      selectedTab = await browser.tabs.create({active: true}); // defaults to about:newtab
      await this._storage.setTabGroup(selectedTab, groupID);
      tabids.push(selectedTab.id);
    } else if (tabIndex) {
      let index = tabIndex < tabids.length ? tabIndex : 0;
      selectedTab = await browser.tabs.get(tabids[index]);
    } else {
      let index = lastSelected < tabids.length ? lastSelected : 0;
      selectedTab = await browser.tabs.get(tabids[index]);
    }

    await this._storage.setCurrentGroup(activeInfo, groupID);
    await browser.tabs.update(selectedTab.id, {active: true});

    await browser.tabs.show(tabids);
    await browser.tabs.hide(tabidsothers);
  },

  /**
   * Selects the next or previous group in the list
   *
   * @param {ActiveInfo} activeInfo
   * @param {Number} direction
   */
  selectNextPrevGroup: async function(activeInfo, direction) {
    let currentGroupID = await this._storage.getCurrentGroupID(activeInfo);
    let groups = await this._storage.getGroups(activeInfo);
    if (groups.length == 0) {
      return;
    }

    let index = groups.findIndex((group) => {
      return group.id == currentGroupID;
    });

    if (index == -1) {
      return;
    }

    index = (index + direction + groups.length) % groups.length;
    await this.selectGroup(activeInfo, groups[index].id);
  },

  /**
   * Updates the currently selected index for the given window
   *
   * @param {ActiveInfo} activeInfo
   */
  updateCurrentSelectedTab: async function(activeInfo) {
    let tabs = await this._storage.getTabs(activeInfo);
    let curtab = tabs.find((tab) => {
      return tab.active;
    });

    if (curtab) {
      let curindex = tabs.filter((tab) => {
        return tab.group == curtab.group;
      }).indexOf(curtab);

      await this._storage.setGroupSelectedIndex(activeInfo, curtab.group, curindex);
    }
  },

  /**
   * Updates the currently selected group based on the active tab
   *
   * @param {ActiveInfo} activeInfo
   */
  updateCurrentSelectedGroup: async function(activeInfo) {
    let tabs = await this._storage.getTabs(activeInfo);
    let curtab = tabs.find((tab) => {
      return tab.active;
    });

    if (curtab) {
      let currentGroupID = await this._storage.getCurrentGroupID(activeInfo);
      if (currentGroupID && curtab.group !== currentGroupID) {
        await this.selectGroup(activeInfo, curtab.group, tabs.indexOf(curtab));
      }
    }
  },

  /**
   * Renames a given group.
   *
   * @param {ActiveInfo} activeInfo
   * @param {Number} groupID - the groupID
   * @param {String} title - the new title
   */
  renameGroup: async function(activeInfo, groupID, title) {
    await this._storage.renameGroup(activeInfo, groupID, title);
  },

  /**
   * Adds a blank group
   *
   * @param {ActiveInfo} activeInfo
   */
  addGroup: async function(activeInfo) {
    await this._storage.addGroup(activeInfo);
  },

  /**
   * Adds a group with associated tab
   *
   * @param {ActiveInfo} activeInfo
   * @param {Number} tabIndex - the tab to place into group
   */
  addGroupWithTab: async function(activeInfo, tabIndex) {
    await this._storage.addGroup(activeInfo);
    let group = await this.getRecentlyAddedGroup(activeInfo);
    await this.moveTabToGroup(
      activeInfo,
      tabIndex,
      group.id
    );
  },

  /**
   * Return recently added group
   *
   * @param {ActiveInfo} activeInfo
   */
  getRecentlyAddedGroup: async function(activeInfo) {
    let currentGoups = await this._storage.getGroups(activeInfo);
    let recentlyAddedGroup = null;
    if (currentGoups.length > 0) {
      recentlyAddedGroup = currentGoups[currentGoups.length - 1];
    }
    return recentlyAddedGroup;
  },

  /**
   * Closes a group and all attached tabs
   *
   * @param {ActiveInfo} activeInfo
   * @param {Number} groupID - the groupID
   */
  closeGroup: async function(activeInfo, groupID) {
    await this._storage.removeGroup(activeInfo, groupID);

    let currentGroupID = await this._storage.getCurrentGroupID(activeInfo);
    if (currentGroupID == groupID) {
      let remainingGroups = await this._storage.getGroups(activeInfo);
      await this.selectGroup(activeInfo, remainingGroups[0].id);
    }

    await this._storage.removeGroupTabs(groupID);
  }
};

export { TabManager as default };