import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import { computed } from "vue";
import store from "@/store";

// vue3的...mapState系列快捷方法
// const [接受者变量1,接收者变量2] = useState("modules名称",["需要的state名称1","需要的state名称2",...])
// 例子:const [token,userInfo] = useState("user",["token","userInfo"])
// useGetters useMutations useActions使用方法和useState一样
export function useState(name, arr) {
  return Object.values(mapState(name, arr)).map((it) =>
    computed(it.bind({ $store: store }))
  );
}

export function useGetters(name, arr) {
  return Object.values(mapGetters(name, arr)).map((it) =>
    computed(it.bind({ $store: store }))
  );
}

export function useMutations(name, arr) {
  return Object.values(mapMutations(name, arr)).map((it) =>
    it.bind({ $store: store })
  );
}

export function useActions(name, arr) {
  return Object.values(mapActions(name, arr)).map((it) =>
    it.bind({ $store: store })
  );
}
