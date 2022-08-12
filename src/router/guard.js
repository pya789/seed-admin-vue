import store from "@/store";
import { PageEnum } from "@/common/page";
import { ErrorPageRoute } from "@/router";
import { deepClone } from "@/utils/obj";
// 免登录白名单
const whiteList = ["login"];
// 全局前置守卫
const createBeforeEach = (router) => {
  router.beforeEach(async (to, from, next) => {
    // 加载进度条
    window.$loadingBar.start();
    // 白名单
    if (whiteList.includes(to?.name)) {
      // token存在禁止进入login页面
      if (store.getters["user/token"]) {
        next(PageEnum.BASE_HOME);
        return;
      }
      next();
      return;
    }

    // Token是否存在
    if (!store.getters["user/token"]) {
      const redirectData = {
        path: PageEnum.BASE_LOGIN,
        replace: true,
      };
      if (to.path) {
        redirectData.query = {
          ...redirectData.query,
          redirect: to.path,
        };
      }
      next(redirectData);
      return;
    }
    // 路由添加是否完成
    if (store.getters["route/isDynamicAddedRoute"]) {
      // 如果是目录就导向错误界面
      if (to.meta?.isDirectory) {
        next({
          path: "/error",
        });
        return;
      }
      const route = {
        fullPath: to.fullPath,
        path: to.path,
        name: to.name,
        params: to.params,
        meta: {
          title: to.meta?.title,
          keepAlive: to.meta?.keepAlive,
          perms: to.meta?.perms,
          affix: to.meta?.affix,
          hideBreadcrumb: to.meta?.hideBreadcrumb,
        },
      };
      await store.dispatch("tabsView/AddTabs", route);
      next();
      return;
    }
    // 获取用户信息
    await store.dispatch("user/GetUserInfo");
    // 动态添加路由表
    await store.dispatch("route/SetRouters");
    const routers = store.getters["route/routers"];
    routers.forEach((item) => {
      router.addRoute(item);
    });
    // 添加404页面
    const isErrorPage = router
      .getRoutes()
      .findIndex((item) => item.name === ErrorPageRoute.name);
    if (isErrorPage === -1) {
      router.addRoute(ErrorPageRoute);
    }

    // 处理导航数据
    const redirectPath = from.query.redirect || to.path;
    const redirect = decodeURIComponent(redirectPath);
    const nextData =
      to.path === redirect
        ? {
            ...to,
            replace: true,
          }
        : {
            path: redirect,
          };
    // 路由添加完成
    store.dispatch("route/SetDynamicAddedRoute", true);
    // 冲
    next(nextData);
  });
};
// 全局解析守卫
const createBeforeResolve = (router) => {
  router.beforeResolve((to) => {
    // console.log("全局解析守卫触发")
  });
};
// 全局后置守卫
const createAfterEach = (router) => {
  router.afterEach((to, from) => {
    // 标题跟随修改
    document.title = to.meta.title || document.title;
    const keepAliveComponents = store.getters["route/keepAliveComponents"];
    const currentComName = to.matched.find(
      (item) => item.name == to.name
    )?.name;
    if (
      currentComName &&
      !keepAliveComponents.includes(currentComName) &&
      to.meta?.keepAlive
    ) {
      // 需要缓存的组件
      keepAliveComponents.push(currentComName);
    } else if (!to.meta?.keepAlive || to.name == "redirect") {
      // 不需要缓存的组件
      const index = store.getters["route/keepAliveComponents"].findIndex(
        (name) => name == currentComName
      );
      if (index != -1) {
        keepAliveComponents.splice(index, 1);
      }
    }
    store.dispatch("route/SetKeepAliveComponents", keepAliveComponents);
    // 结束进度条
    window.$loadingBar.finish();
    // console.log("全局后置守卫触发")
  });
};
export default {
  createBeforeEach,
  createBeforeResolve,
  createAfterEach,
};
