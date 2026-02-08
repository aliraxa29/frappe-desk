import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import { setupRouterGuards } from "./guards";

export const router = createRouter({
  history: createWebHistory("/dashboard/"),
  routes,
});

// Setup authentication guards
setupRouterGuards(router);
