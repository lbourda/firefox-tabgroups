import SessionStorage from "./lib/storage/session.js";
import TabManager from "./lib/tabmanager.js";

var _this;

function TabGroups() {
  _this = this;
  this._tabs = new TabManager(new SessionStorage());

  this.init();
  this.bindEvents();
}

TabGroups.prototype = {
  init: function() {
    this.handleHotkeys();
  },

  bindEvents: function() {
    this.bindPanelEvents();
    this.bindTabEvents();
    this.bindStorageEvents();
  },

  handleHotkeys: async function() {
    let storedItems = await browser.storage.local.get({
      "bindPanoramaShortcut": true,
      "bindNavigationShortcut": true
    });

    this.bindPanoramaShortcut = storedItems.bindPanoramaShortcut;
    this.bindNavigationShortcut = storedItems.bindNavigationShortcut;
  
    browser.commands.onCommand.addListener(async (command) => {
      switch (command) {
        case "open-popup":
          if (_this.bindPanoramaShortcut) {
            browser.browserAction.openPopup();
          }
          break;
        case "select-prev-group":
          if (_this.bindNavigationShortcut) {
            _this._tabs.selectNextPrevGroup(await _this._getWindow(), -1);
          }
          break;
        case "select-next-group":
          if (_this.bindNavigationShortcut) {
            _this._tabs.selectNextPrevGroup(await _this._getWindow(), 1);
          }
          break;
      };
    }); 
  },
  
  bindPanelEvents: function() {
    browser.runtime.onMessage.addListener((message) => {
      switch (message.command) {
        case "Group:Add":
          this.onGroupAdd(message.data);
          break;
        case "Group:AddWithTab":
          this.onGroupAddWithTab(message.data);
          break;
        case "Group:Close":
          this.onGroupClose(message.data);
          break;
        case "Group:Rename":
          this.onGroupRename(message.data);
          break;
        case "Group:Select":
          this.onGroupSelect(message.data);
          break;
        case "Group:Drop":
          this.onGroupDrop(message.data);
          break;
        case "Tab:Select":
          this.onTabSelect(message.data);
          break;
        case "UI:Refresh":
          this.refreshUi();
          break;
      };
    });
  },

  bindTabEvents: function() {
    browser.tabs.onActivated.addListener((activeInfo) => {
      _this._tabs.updateCurrentSelectedTab(activeInfo);
      _this._tabs.updateCurrentSelectedGroup(activeInfo);
    });
  },

  bindStorageEvents: function() {
    browser.storage.onChanged.addListener(function(changes, area) {
      for (let change in changes) {
        if (change == "bindPanoramaShortcut") {
          _this.bindPanoramaShortcut = changes[change].newValue;
        } else if (change == "bindNavigationShortcut") {
          _this.bindNavigationShortcut = changes[change].newValue;
        }
      }
    });
  },

  refreshUi: async function() {
    let storedItems = await browser.storage.local.get({
      "enableAlphabeticSort": false,
      "groupCloseTimeout": 3
    });

    let tabgroups = await this._tabs.getGroupsWithTabs(await this._getWindow(), storedItems.enableAlphabeticSort);
    browser.runtime.sendMessage({command: "Groups:Changed", data: {tabgroups}});

    browser.runtime.sendMessage({command: "Groups:CloseTimeoutChanged", data: {timeout: storedItems.groupCloseTimeout}});
  },

  onGroupAdd: async function() {
    await this._tabs.addGroup(await this._getWindow());
    this.refreshUi();
  },

  onGroupAddWithTab: async function(event) {
    await this._tabs.addGroupWithTab(await this._getWindow(), event.tabIndex);
    this.refreshUi();
  },

  onGroupClose: async function(event) {
    await this._tabs.closeGroup(await this._getWindow(), event.groupID);
    this.refreshUi();
  },

  onGroupRename: async function(event) {
    await this._tabs.renameGroup(await this._getWindow(), event.groupID, event.title);
    this.refreshUi();
  },

  onGroupSelect: async function(event) {
    await this._tabs.selectGroup(await this._getWindow(), event.groupID);
    this.refreshUi();
  },

  onTabSelect: async function(event) {
    await this._tabs.selectTab(await this._getWindow(), event.tabIndex, event.groupID);
    this.refreshUi();
  },

  onGroupDrop: async function(event) {
    await this._tabs.moveTabToGroup(await this._getWindow(), event.tabIndex, event.targetGroupID);
    this.refreshUi();
  },

  _getWindow: async function() {
    let currentWindow = await browser.windows.getCurrent();
    return { windowId: currentWindow.id };
  },
};

new TabGroups();