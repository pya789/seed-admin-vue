import store from "@/store";
export const checkPerms = (value) => {
  const userPerms = store.getters["route/perms"];
  if (value && value instanceof Array && value.length > 0) {
    return andVerify(value, userPerms);
  } else if (value && value instanceof Object) {
    if (value.and) {
      return andVerify(value.and, userPerms);
    } else if (value.or) {
      return orVerify(value.or, userPerms);
    } else {
      throw new Error(`权限对象key仅可为or或and`);
    }
  } else {
    throw new Error(`设置的权限参数格式错误`);
  }
};
export const checkRoles = (value) => {
  const userRoles = store.getters["route/roles"];
  if (value && value instanceof Array && value.length > 0) {
    return andVerify(value, userRoles);
  } else if (value && value instanceof Object) {
    if (value.and) {
      return andVerify(value.and, userRoles);
    } else if (value.or) {
      return orVerify(value.or, userRoles);
    } else {
      throw new Error(`权限对象key仅可为or或and`);
    }
  } else {
    throw new Error(`设置的权限参数格式错误`);
  }
};
// AND验证
export const andVerify = (verifyData, userData) => {
  let count = 0;
  userData.forEach((item) => {
    if (verifyData.includes(item)) {
      count++;
    }
  });
  if (count != verifyData.length) {
    return false;
  }
  return true;
};
// OR验证
export const orVerify = (verifyData, userData) => {
  const hasPerm = userData.some((item) => {
    return verifyData.includes(item);
  });
  return hasPerm;
};
