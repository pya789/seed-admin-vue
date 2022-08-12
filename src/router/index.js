import { createRouter, createWebHistory } from "vue-router";
import { PageEnum } from "@/common/page";
import Guard from "./guard";
import Layout from "@/layout";

// 404错误页面
export const ErrorPageRoute = {
  path: "/:path(.*)*",
  name: "ErrorPage",
  component: Layout,
  meta: {
    title: "ErrorPage",
  },
  children: [
    {
      path: "/:path(.*)*",
      name: "ErrorPageSon",
      component: () => import("@/pages/error/index.vue"),
      meta: {
        title: "ErrorPage",
      },
    },
  ],
};

// 基础路由
export const routes = [
  // 登录页
  {
    path: PageEnum.BASE_LOGIN,
    name: PageEnum.BASE_LOGIN_NAME,
    meta: {
      title: import.meta.env.VITE_TITLE,
      hideBreadcrumb: true,
    },
    component: () => import("@/pages/login/index.vue"),
  },
  {
    path: PageEnum.USER_SETTING,
    name: PageEnum.USER_SETTING_NAME,
    component: Layout,
    children: [
      {
        path: PageEnum.USER_SETTING,
        name: "userSettingSon",
        component: () => import("@/pages/system/user/setting/index.vue"),
        meta: {
          title: "个人设置",
        },
      },
    ],
  },
  // 首页重定向
  {
    path: PageEnum.BASE_HOME,
    name: "index",
    redirect: PageEnum.BASE_HOME_REDIRECT,
    meta: {
      title: "index",
      hideBreadcrumb: true,
    },
  },
  // 重定向匹配
  {
    path: PageEnum.REDIRECT,
    name: PageEnum.REDIRECT_NAME,
    component: Layout,
    meta: {
      title: "redirect",
      hideBreadcrumb: true,
    },
    children: [
      {
        path: "/redirect/:path(.*)",
        name: "redirectSon",
        component: () => import("@/pages/redirect/index.vue"),
        meta: {
          title: "redirect",
          hideBreadcrumb: true,
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(""),
  routes: routes,
  strict: true,
});
Guard.createBeforeEach(router);
Guard.createBeforeResolve(router);
Guard.createAfterEach(router);
export default router;
