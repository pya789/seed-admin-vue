// 格式化时间
export const timeFormat = (time) => {
  return time.replace("T", " ").replace(/\+[012]\d:00/, "");
};
