import { createDiscreteApi } from "naive-ui";
// 想挂什么自己再加
export const loadWindowFunc = () => {
  discreteApiInit();
};
// 挂载api
const discreteApiInit = () => {
  const { message, notification, dialog, loadingBar } = createDiscreteApi(
    ["message", "dialog", "notification", "loadingBar"],
    {
      loadingBarProviderProps: {
        themeOverrides: {
          colorLoading: "#2d8cf0",
          colorError: "#de576d",
        },
      },
    }
  );
  window["$message"] = message;
  window["$notification"] = notification;
  window["$dialog"] = dialog;
  window["$loadingBar"] = loadingBar;
};
