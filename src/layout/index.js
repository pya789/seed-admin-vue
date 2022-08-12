export { default as Header } from "./components/Header/index.vue";
export { default as Menu } from "./components/Menu/index.vue";
export { default as Logo } from "./components/Logo/index.vue";
export { default as TagsView } from "./components/TagsView/index.vue";
export { default as Main } from "./components/Main/index.vue";
export { default as Footer } from "./components/Footer/index.vue";
export default () => import("@/layout/index.vue");
