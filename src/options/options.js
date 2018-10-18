import React from "react";
import ReactDOM from "react-dom";

class Options extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      enableAlphabeticSort: false,
      groupCloseTimeout: 3,
      bindPanoramaShortcut: true,
      bindNavigationShortcut: true,
      panoramaShortcut: "Ctrl+Shift+L",
      navPrevShortcut: "Ctrl+F1",
      navNextShortcut: "Ctrl+Shift+F1",
    };

    this.setEnableAlphabeticSort = this.setEnableAlphabeticSort.bind(this);
    this.setCloseTimeout = this.setCloseTimeout.bind(this);
    this.setBindPanoramaShortcut = this.setBindPanoramaShortcut.bind(this);
    this.setBindNavigationShortcut = this.setBindNavigationShortcut.bind(this);
    this.setPanoramaShortcut = this.setPanoramaShortcut.bind(this);
    this.setNavPrevShortcut = this.setNavPrevShortcut.bind(this);
    this.setNavNextShortcut = this.setNavNextShortcut.bind(this);
  }

  setEnableAlphabeticSort() {
    let value = document.getElementById("enableAlphabeticSort").checked;
    this.setState({enableAlphabeticSort: value});
    browser.storage.local.set({enableAlphabeticSort: value});
  }

  setCloseTimeout() {
    let value = parseInt(document.getElementById("groupCloseTimeout").value);
    this.setState({groupCloseTimeout: value});
    browser.storage.local.set({groupCloseTimeout: value});
  }
  
  setBindPanoramaShortcut() {
    let value = document.getElementById("bindPanoramaShortcut").checked;
    this.setState({bindPanoramaShortcut: value});
    browser.storage.local.set({bindPanoramaShortcut: value});
  }

  setBindNavigationShortcut() {
    let value = document.getElementById("bindNavigationShortcut").checked;
    this.setState({bindNavigationShortcut: value});
    browser.storage.local.set({bindNavigationShortcut: value});
  }

  setPanoramaShortcut() {
    let value = document.getElementById("panoramaShortcut").value;
    this.setState({panoramaShortcut: value});
    browser.storage.local.set({panoramaShortcut: value});

    browser.commands.update({
      name: "open-popup",
      shortcut: value
    });
  }
  
  setNavPrevShortcut() {
    let value = document.getElementById("navPrevShortcut").value;
    this.setState({navPrevShortcut: value});
    browser.storage.local.set({navPrevShortcut: value});

    browser.commands.update({
      name: "select-prev-group",
      shortcut: value
    });
  }

  setNavNextShortcut() {
    let value = document.getElementById("navNextShortcut").value;
    this.setState({navNextShortcut: value});
    browser.storage.local.set({navNextShortcut: value});

    browser.commands.update({
      name: "select-next-group",
      shortcut: value
    });
  }

  async getManifestShortcuts() {
    let obj = {};
    let getCommands = await browser.commands.getAll();
    for (let command of getCommands) {
      switch (command.name) {
        case "_execute_browser_action":
          obj.panoramaShortcut = command.shortcut;
          break;
        case "select-prev-group":
          obj.navPrevShortcut = command.shortcut;
          break;
        case "select-next-group":
          obj.navNextShortcut = command.shortcut;
          break;
      }
    }

    return obj;
  }

  async componentDidMount() {
    let manifestShortcuts = await this.getManifestShortcuts();

    let storedItems = browser.storage.local.get({
      "enableAlphabeticSort": false,
      "groupCloseTimeout": 3,
      "bindPanoramaShortcut": true,
      "bindNavigationShortcut": false,
      "panoramaShortcut": manifestShortcuts.panoramaShortcut,
      "navPrevShortcut": manifestShortcuts.navPrevShortcut,
      "navNextShortcut": manifestShortcuts.navNextShortcut
    });

    storedItems.then((res) => {
      this.setState({
        enableAlphabeticSort: res.enableAlphabeticSort,
        groupCloseTimeout: res.groupCloseTimeout,
        bindPanoramaShortcut: res.bindPanoramaShortcut,
        bindNavigationShortcut: res.bindNavigationShortcut,
        panoramaShortcut: res.panoramaShortcut,
        navPrevShortcut: res.navPrevShortcut,
        navNextShortcut: res.navNextShortcut
      });
    });
  }

  render() {
    return (
      <form>
        <hr/>
        <div className="grid-container">
          <div className="grid-item grid-column1">
            <label>{browser.i18n.getMessage("optionsEnableAlphabeticSortLabel")}</label>
          </div>
          <div className="grid-item grid-column2">
            <input type="checkbox" id="enableAlphabeticSort"
              checked={this.state.enableAlphabeticSort}
              onChange={this.setEnableAlphabeticSort}
              />
          </div>
          <div/>

          <div className="grid-item grid-column1">
            <label>{browser.i18n.getMessage("optionsGroupUndoCloseTimeoutLabel")}</label>
          </div>
          <div className="grid-item grid-column2">
            <input type="number" min="0" step="1" id="groupCloseTimeout"
              className="number-input"
              value={this.state.groupCloseTimeout}
              onChange={this.setCloseTimeout}
              />
          </div>
          <div/>

          <div className="grid-item grid-column1">
            <label>{browser.i18n.getMessage("optionsOpenShortcutLabel")}</label>
          </div>
          <div className="grid-item grid-column2">
            <input type="checkbox" id="bindPanoramaShortcut"
              checked={this.state.bindPanoramaShortcut}
              onChange={this.setBindPanoramaShortcut}
              />
          </div>
          <div>
            <input type="text" id="panoramaShortcut"
              className="shortcut-input"
              value={this.state.panoramaShortcut}
              onChange={this.setPanoramaShortcut}
              />
          </div>

          <div className="grid-item grid-column1">
            <label>{browser.i18n.getMessage("optionsNavigateShortcutsLabel")}</label>
          </div>
          <div className="grid-item grid-column2">
            <input type="checkbox" id="bindNavigationShortcut"
              checked={this.state.bindNavigationShortcut}
              onChange={this.setBindNavigationShortcut}
              />
          </div>
          <div>
            <div tooltip={browser.i18n.getMessage("optionsGoToPreviousGroupTooltip")} className="inlined-div">
              <input type="text" id="navPrevShortcut"
                className="shortcut-input"
                value={this.state.navPrevShortcut}
                onChange={this.setNavPrevShortcut}
                />
            </div>
            <div tooltip={browser.i18n.getMessage("optionsGoToNextGroupTooltip")} className="inlined-div">
              <input type="text" id="navNextShortcut"
                className="shortcut-input"
                value={this.state.navNextShortcut}
                onChange={this.setNavNextShortcut}
                />
            </div>
          </div>
        </div>

        <br/>
        <a href="https://developer.mozilla.org/en-US/Add-ons/WebExtensions/manifest.json/commands#Key_combinations" target="_blank">
          Shortcut Keys Format
        </a>

        <hr/>
      </form>
    );
  }
};

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(<Options/>, document.getElementById("content"));
});