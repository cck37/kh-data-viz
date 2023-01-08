import { createRouter, createWebHistory } from "vue-router";
//import HomeView from "../views/HomeView.vue";
import views from "../views";

export const routes = [
  { path: "/", component: views.Home, friendlyName: "Home" },
  { path: "/1", component: views.KH1, friendlyName: "Kingdom Hearts 1" },
  { path: "/2", component: views.KH2, friendlyName: "Kingdom Hearts 2" },
  { path: "/3", component: views.KH3, friendlyName: "Kingdom Hearts 3" },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
