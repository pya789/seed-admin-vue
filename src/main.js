import { createApp } from "vue";
import App from "./App.vue";
import Router from "@/router";
import store from "@/store";
import useDirective from "@/common/directive";
async function run() {
  const app = createApp(App);
  // 引入全局自定义指令
  useDirective(app);
  app.use(store).use(Router).mount("#app");
}
run();
