// 默认缓存期限为7天
const DEFAULT_CACHE_TIME = 60 * 60 * 24 * 7;
export default class Storage {
  static set(key, value, exp = DEFAULT_CACHE_TIME) {
    const data = JSON.stringify({
      value,
      exp: exp != null ? new Date().getTime() + exp * 1000 : null,
    });
    localStorage.setItem(key, data);
  }
  static get(key) {
    const item = localStorage.getItem(key);
    if (item) {
      try {
        const data = JSON.parse(item);
        const { value, exp } = data;
        // 在有效期内直接返回
        if (exp === null || exp >= Date.now()) {
          return value;
        }
        Storage.remove(key);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
  static remove(key) {
    localStorage.removeItem(key);
  }
  static clear() {
    localStorage.clear();
  }
}
