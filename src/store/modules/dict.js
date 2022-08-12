import { useHttp } from "@/http";
const http = useHttp();
export default {
  namespaced: true,
  state: () => ({
    dictObj: {},
  }),
  getters: {
    dict(state) {
      return state.dictObj;
    },
  },
  mutations: {
    addDictObj(state, dictMap) {
      state.dictObj = { ...state.dictObj, ...dictMap };
    },
  },
  actions: {
    async GetDictType({ commit, state }, type) {
      if (state.dictObj[type] && state.dictObj[type].length > 0) {
        return true;
      }
      const res = await http.get("dict/typeData", {
        params: { type: type },
      });
      if (res.data?.length <= 0) {
        return false;
      }
      const dictMap = {};
      dictMap[type] = res.data;
      commit("addDictObj", dictMap);
      return true;
    },
  },
};
