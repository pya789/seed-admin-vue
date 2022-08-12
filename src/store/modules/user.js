import { useHttp } from "@/http";
import router from "@/router/index";
import store from "@/store";
const http = useHttp();
export default {
  namespaced: true,
  state: () => ({
    token: null,
    userInfo: null,
  }),
  getters: {
    token(state) {
      return state.token;
    },
    userInfo(state) {
      return state.userInfo;
    },
  },
  mutations: {
    setToken(state, val) {
      state.token = val;
    },
    setUserInfo(state, val) {
      state.userInfo = val;
    },
  },
  actions: {
    // 获取用户信息
    async GetUserInfo({ commit }) {
      const res = await http.get("user/person");
      commit("setUserInfo", res.data);
      store.commit("route/addRoles", res.data.roles);
    },
    // 退出登陆
    LogOut({ commit }) {
      commit("setToken", null);
      commit("setUserInfo", null);
      store.commit("tabsView/setTabsList", []);
      router
        .replace({
          name: "login",
        })
        .finally(() => {
          location.reload();
        });
    },
  },
};
