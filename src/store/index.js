import { createStore } from "vuex";
import route from "@/store/modules/route";
import user from "@/store/modules/user";
import tabsView from "@/store/modules/tabsView";
import dict from "@/store/modules/dict";
import createPersistedState from "vuex-persistedstate";
export default createStore({
  state: () => ({}),
  actions: {},
  modules: {
    route,
    user,
    tabsView,
    dict,
  },
  plugins: [
    createPersistedState({
      paths: ["user", "tabsView"],
    }),
  ],
});
