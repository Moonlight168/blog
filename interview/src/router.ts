import { createRouter, createWebHistory } from "vue-router";
import InterviewHistory from "./views/InterviewHistory.vue";
import InterviewHistoryDetail from "./views/InterviewHistoryDetail.vue";
import InterviewWorkspace from "./views/InterviewWorkspace.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: InterviewWorkspace },
    { path: "/history", component: InterviewHistory },
    { path: "/history/:id", component: InterviewHistoryDetail },
  ],
});
