import store from "@/store";
import { andVerify, orVerify } from "@/utils/auth";
// 菜单权限
const usePerms = (app) => {
  app.directive("perms", (el, binding, vnode) => {
    const { value } = binding;
    const userPerms = store.getters["route/perms"];
    let hasPerm = false;
    if (value && value instanceof Array && value.length > 0) {
      hasPerm = andVerify(value, userPerms);
    } else if (value && value instanceof Object) {
      if (value.and) {
        hasPerm = andVerify(value.and, userPerms);
      } else if (value.or) {
        hasPerm = orVerify(value.or, userPerms);
      } else {
        throw new Error(`权限对象key仅可为or或and且value不可为空`);
      }
    } else {
      throw new Error(`设置的权限参数格式错误`);
    }
    if (!hasPerm) {
      el.parentNode && el.parentNode.removeChild(el);
    }
  });
};
// 角色权限
// 参数为数组时默认条件为AND
//
const useRoles = (app) => {
  app.directive("roles", (el, binding, vnode) => {
    const { value } = binding;
    const userRoles = store.getters["route/roles"];
    let hasPerm = false;
    if (value && value instanceof Array && value.length > 0) {
      hasPerm = andVerify(value, userRoles);
    } else if (value && value instanceof Object) {
      if (value.and) {
        hasPerm = andVerify(value.and, userRoles);
      } else if (value.or) {
        hasPerm = orVerify(value.or, userRoles);
      } else {
        throw new Error(`权限对象key仅可为or或and且value不可为空`);
      }
    } else {
      throw new Error(`设置的权限参数格式错误`);
    }
    if (!hasPerm) {
      el.parentNode && el.parentNode.removeChild(el);
    }
  });
};
const useDirective = (app) => {
  usePerms(app);
  useRoles(app);
};
export default useDirective;
