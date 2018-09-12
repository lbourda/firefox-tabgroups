import Immutable from "immutable";

const INITIAL_STATE = Immutable.fromJS({
  tabgroups: [],
  closeTimeout: 0
});

const Reducer = function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case "TABGROUPS_RECEIVE":
      return state.set("tabgroups", action.tabgroups);
    case "GROUP_CLOSE_TIMEOUT_RECEIVE":
      return state.set("closeTimeout", action.closeTimeout);
    default:
      return state;
  }
};

export { Reducer as default };