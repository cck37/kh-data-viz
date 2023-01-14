import { createRouter, createWebHistory } from "vue-router";
//import HomeView from "../views/HomeView.vue";
import views from "../views";

export const routes = [
  { path: "/", component: views.Home, friendlyName: "Home" },
  {
    path: "/1",
    component: views.RecipesEssay,
    friendlyName: "Recipes",
  },
  { path: "/2", component: views.KH2, friendlyName: "Enemies" },
  { path: "/3", component: views.KH3, friendlyName: "Gummis" },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
