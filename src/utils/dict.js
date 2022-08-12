import store from "@/store";
// 获取字典
export const getDict = async (type) => {
  await store.dispatch("dict/GetDictType", type);
  const dictMap = store.getters["dict/dict"][type];
  return dictMap;
};
// 获取Label
export const getLabel = (type, value) => {
  const dictMap = store.getters["dict/dict"][type];
  // 未找到此字典类型
  if (dictMap == undefined || dictMap?.length <= 0) {
    return "unknown type";
  }
  let resStr = value;
  // 翻译一蛤
  dictMap.forEach((item) => {
    if (item.value == value) {
      resStr = item.label;
    }
  });
  return resStr;
};
