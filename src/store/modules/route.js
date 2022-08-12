import { useHttp } from "@/http";
import { generatorRouter } from "@/utils/router";
const http = useHttp();
export default {
  namespaced: true,
  state: () => ({
    menus: [],
    routers: [],
    perms: [],
    roles: [],
    keepAliveComponents: null,
    isDynamicAddedRoute: false,
  }),
  getters: {
    menus(state) {
      return state.menus;
    },
    routers(state) {
      return state.routers;
    },
    perms(state) {
      return state.perms;
    },
    roles(state) {
      return state.roles;
    },
    keepAliveComponents(state) {
      if (!state.keepAliveComponents) return [];
      return state.keepAliveComponents;
    },
    isDynamicAddedRoute(state) {
      return state.isDynamicAddedRoute;
    },
  },
  mutations: {
    addMenus(state, data) {
      state.menus = data;
    },
    addRouters(state, data) {
      state.routers = data;
    },
    addPerms(state, data) {
      state.perms = data;
    },
    addRoles(state, data) {
      state.roles = data;
    },
    setKeepAliveComponents(state, compNames) {
      state.keepAliveComponents = compNames;
    },
    setIsDynamicAddedRoute(state, added) {
      state.isDynamicAddedRoute = added;
    },
  },
  actions: {
    async SetRouters({ commit }) {
      const res = await http.get("menu/permMenu");
      commit("addMenus", res.data.menus);
      commit("addPerms", res.data.perms);
      const routers = generatorRouter(res.data.menus);
      commit("addRouters", routers);
    },
    SetDynamicAddedRoute({ commit }, added) {
      commit("setIsDynamicAddedRoute", added);
    },
    SetKeepAliveComponents({ commit }, compNames) {
      commit("setKeepAliveComponents", compNames);
    },
  },
};
