import store from "@/store";
// 保护首页路由
// 因为很多人可能不需要仪表盘这类的玩意所以暂时用不上
// 如果要用需要给要固定的路由mete对象内一个affix属性(bool类型)即可
const retainAffixRoute = (list) => {
  return list.filter((item) => item?.meta?.affix ?? false);
};

export default {
  namespaced: true,
  state: () => ({
    tabsList: [],
  }),
  getters: {
    tabsList(state) {
      return state.tabsList;
    },
  },
  mutations: {
    addTabsList(state, item) {
      state.tabsList.push(item);
    },
    spliceTabsList(state, index) {
      state.tabsList.splice(index, 1);
    },
    setTabsList(state, tabsList) {
      state.tabsList = tabsList;
    },
  },
  actions: {
    AddTabs({ commit, state }, route) {
      if (route.meta?.hideBreadcrumb) return;
      const isExists = state.tabsList.some(
        (item) => item.fullPath == route.fullPath
      );
      if (!isExists) {
        commit("addTabsList", route);
      }
      return true;
    },
    // 关闭当前
    CloseCurrentTab({ commit, state }, route) {
      const index = state.tabsList.findIndex(
        (item) => item.fullPath == route.fullPath
      );
      commit("spliceTabsList", index);
    },
    // 关闭其他
    CloseOtherTabs({ state }, route) {
      state.tabsList = state.tabsList.filter(
        (item) => item.fullPath == route.fullPath || item?.meta?.affix == true
      );
      const keepAliveComponents = [];
      if (route.meta.keepAlive) {
        keepAliveComponents.push(route.name);
      }
      store.dispatch("route/SetKeepAliveComponents", keepAliveComponents);
    },
    // 关闭全部
    CloseAllTabs({ commit, state }) {
      store.dispatch("route/SetKeepAliveComponents", []);
      commit("setTabsList", retainAffixRoute(state.tabsList));
    },
  },
};
