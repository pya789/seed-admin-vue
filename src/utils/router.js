import Layout from "@/layout";
// 匹配规则
const modules = {
  ...import.meta.glob("../pages/**/**.vue"),
  ...import.meta.glob("../pages/**/**.jsx"),
};
// 处理路由
export const generatorRouter = (routers) => {
  let arr = [];
  routers.forEach((item) => {
    let tmp = { ...item };
    if (tmp.children && tmp.children.length != 0) {
      tmp.children = generatorRouter(tmp.children, arr);
    }
    if (tmp.meta?.type == 0) {
      tmp.meta.isDirectory = true;
      if (tmp.meta?.isRoot) {
        tmp.component = Layout;
      } else {
        tmp.component = () => import("@/layout/parentLayout.vue");
      }
    }
    if (tmp.meta?.type == 1) {
      tmp.meta.isDirectory = false;
      delete tmp.children;
      if (tmp.meta?.isRoot) {
        tmp.component = modules[`../pages${item.component}`];
        tmp = {
          path: tmp.path,
          component: Layout,
          children: [tmp],
        };
      } else {
        tmp.component = modules[`../pages${item.component}`];
      }
    }
    arr.push(tmp);
  });
  return arr;
};
