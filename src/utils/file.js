// 扫描文件
export const findFiles = () => {
  const files = import.meta.glob(["../pages/**/**.vue", "../pages/**/**.jsx"], {
    eager: true,
  });
  let list = [];
  for (const item of Object.keys(files)) {
    // 排除components组件
    if (!item.includes("components")) {
      const path = item.slice(8);
      list.push({
        value: path,
        label: path,
      });
    }
  }
  return list;
};
