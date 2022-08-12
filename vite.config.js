import { loadEnv, defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import VueSetupExtend from "vite-plugin-vue-setup-extend";
import path from "path";
// 配置文档地址:https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const root = process.cwd();
  const env = loadEnv(mode, root);
  return {
    base: env.VITE_BASE_PATH,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    logLevel: "info",
    server: {
      port: env.VITE_PORT,
      // 是否启用跨域代理
      // proxy: {
      //     '/api': {
      //         target: '',
      //         changeOrigin: true,
      //         rewrite: (path) => path.replace(/^\/api/, '/api/v1')
      //     }
      // }
    },
    build: {
      target: "es2020",
    },
    plugins: [vue(), vueJsx(), VueSetupExtend()],
  };
});
