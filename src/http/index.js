import axios from "axios";
import router from "@/router/index";
import store from "@/store";
export default class Http {
  // axios实例
  client = null;
  // 白名单
  whiteList = ["user/login", "user/captcha"];
  // 取消标记
  CancelToken = axios.CancelToken;
  source = this.CancelToken.source();
  // 并发
  All = axios.all;
  // 并发结果展开 理论上没卵用
  // 建议使用await语法糖 + 数组解构赋值接收结果
  // 例如 const [a, b] = await http.All([http.Get("user/info"), http.Post("user/login")])
  Spread = axios.spread;
  // 构造函数
  constructor(url) {
    // 创建实例
    this.client = axios.create({
      baseURL: url ? url : "/api",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
    });
    // 加载拦截器
    this.requestInterceptors();
    this.responseInterceptors();
  }
  // 请求拦截器
  requestInterceptors() {
    this.client?.interceptors.request.use((config) => {
      // console.log("请求拦截器触发=>", config);
      if (this.whiteList.includes(config.url)) {
        delete config.headers.Authorization;
      } else {
        // 非白名单携带Token
        const token = store.getters["user/token"];
        // token不存在时进行处理
        if (token == null) {
          // 从来源创建取消标记
          config.cancelToken = this.source.token;
          // 取消并返回错误消息
          this.source.cancel("未找到Token,即将为您跳转");
          // 延时导航至登录页
          setTimeout(() => {
            window.$message.destroyAll();
            router.push("/login");
          }, 2000);
        }
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }
  // 响应拦截器
  responseInterceptors() {
    this.client?.interceptors.response.use(
      (response) => {
        // console.log("响应拦截器触发=>", response);
        const code = response.data.code || 1000;
        const message = response.data.message;
        switch (code) {
          // 成功
          case 1000:
            return response.data;
          // 鉴权失败执行退出逻辑
          case 1004:
            window.$message.destroyAll();
            window.$message.error(message);
            setTimeout(() => {
              store.dispatch("user/LogOut");
            }, 2000);
            return Promise.reject(new Error(message));
          // 错误代码1001,1002和一些未识别的code进行统一处理
          // 使用try{}catch(err){}finally{}拦截异常进行之后的业务逻辑
          // 如果不需要自动消息可新增一个case对应一个code直接抛出异常即可 如下
          // case xxxx:
          //   return Promise.reject(response.data);
          default:
            window.$message.destroyAll();
            window.$message.error(message);
            return Promise.reject(response.data);
        }
      },
      (err) => {
        window.$message.destroyAll();
        switch (err.response?.status) {
          case 500:
            window.$message.error("错误代码:500,多为后端错误,请后端自裁谢罪吧");
            return Promise.reject(
              new Error("错误代码:500,多为后端错误,请后端自裁谢罪吧")
            );
          case 404:
            window.$message.error(
              "错误代码:404,可能是请求地址不对或者后端无此接口"
            );
            return Promise.reject(
              new Error("错误代码:404,可能是请求地址不对或者后端无此接口")
            );
          default:
            window.$message.error(err.message);
            return Promise.reject(new Error(err.message));
        }
      }
    );
  }
}
// 便捷方法
export function useHttp(url) {
  return new Http(url)?.client;
}
