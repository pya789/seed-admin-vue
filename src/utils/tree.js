import { PageEnum } from "@/common/page";
import { h } from "vue";
import { NIcon } from "naive-ui";
import { iconObj } from "@/utils/icon.js";
// render 常规图标
export function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) });
}
// render 菜单图标
export function renderMenuIcon(icon) {
  if (icon) {
    return () => h(NIcon, null, { default: () => h(iconObj[icon]) });
  } else {
    return () => h(NIcon, null, { default: () => h("template") });
  }
}

// 排除无需显示的路由
export function filterRouter(routerMap) {
  return routerMap.filter((item) => {
    return (
      (!item.meta?.visible || false) != true &&
      !["/:path(.*)*", "/", PageEnum.REDIRECT, PageEnum.BASE_LOGIN].includes(
        item.path
      )
    );
  });
}
// 排除面包屑无需显示的路由
export function filterBreadcrumbRouter(routerMap) {
  const res = [];
  routerMap.forEach((item) => {
    if (item.meta?.visible) {
      res.push(item);
    }
    if (!item.meta?.visible && item.children?.length == 0) {
      res.push(item);
    }
  });
  return res;
}
// 组装面包屑菜单
export const generatorBreadcrumbTree = (menuMap) => {
  return filterBreadcrumbRouter(menuMap).map((item) => {
    const currentMenu = {
      ...item,
      label: item.meta.title,
      key: item.name,
      value: item.path,
      disabled: item.path === "/",
    };
    if (item.name === "ErrorPage") {
      currentMenu.children = [];
    } else {
      // 是目录就递归处理子项目
      if (item.meta?.type == 0) {
        // Recursion
        currentMenu.children = generatorBreadcrumbTree(
          item.children,
          currentMenu
        );
      }
      if (item.meta?.type == 1) {
        delete currentMenu.children;
      }
    }
    return currentMenu;
  });
};
// 解析菜单树
export function generatorMenuTree(menuMap, isSearch = false) {
  return filterRouter(menuMap).map((item) => {
    const currentMenu = {
      ...item.meta,
      type: isSearch
        ? item.meta?.type == 0 && isSearch
          ? "group"
          : null
        : item.meta?.type,
      label: item.meta?.title,
      key: item.name,
      value: item.name,
      icon: renderMenuIcon(item.meta?.icon),
    };
    // 是目录就递归处理子项目
    if (item.meta?.type == 0) {
      currentMenu.children = generatorMenuTree(item.children, isSearch);
    }
    // 是菜单就删除空的子项目
    if (item.meta?.type == 1) {
      delete currentMenu.children;
    }
    return currentMenu;
  });
}
// 解析菜单列表树
export function generatorMenuListTree(menuMap) {
  return menuMap.map((item) => {
    const currentMenu = {
      ...item,
      ...item.meta,
      type: item.meta?.type,
      label: item.meta?.title,
      key: item.name,
      value: item.name,
      icon: renderMenuIcon(item.meta?.icon),
      keepAlive: item.meta?.keepAlive ? 1 : 0,
      perms: item.meta?.perms,
      sort: item.meta?.sort,
      status: item.meta?.status,
      visible: item.meta?.visible ? 0 : 1,
    };
    // 是目录就递归处理子项目
    if (item.children && item.children.length != 0) {
      currentMenu.children = generatorMenuListTree(item.children);
    }
    return currentMenu;
  });
}
// 解析菜单选择框树
export function generatorMenuSelectTree(menuMap) {
  return menuMap.map((item) => {
    const currentMenu = {
      label: item.meta?.title,
      key: item.id,
      value: item.name,
    };
    // 是目录就递归处理子项目
    if (item.children && item.children.length != 0) {
      // Recursion
      currentMenu.children = generatorMenuSelectTree(item.children);
    }
    return currentMenu;
  });
}
// 解析角色树
export function generatorRoleTree(roleMap) {
  return roleMap.map((item) => {
    const current = {
      label: item.name,
      value: item.id,
    };
    return current;
  });
}
// 解析部门树
export function generatorDeptTree(deptMap) {
  return deptMap.map((item) => {
    const current = {
      label: item.name,
      key: item.id,
      value: item.name,
    };
    // 是目录就递归处理子项目
    if (item.children && item.children.length != 0) {
      // Recursion
      current.children = generatorDeptTree(item.children);
    }
    return current;
  });
}
