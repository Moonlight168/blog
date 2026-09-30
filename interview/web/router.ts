import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: () => import("./pages/InterviewWorkspace.vue") },
    { path: "/resume", component: () => import("./pages/ResumeEditor.vue") },
    { path: "/self-intro", component: () => import("./pages/SelfIntro.vue") },
    { path: "/history", component: () => import("./pages/InterviewHistory.vue") },
    { path: "/history/:id", component: () => import("./pages/InterviewHistoryDetail.vue") },
    { path: "/real-interview/:id", component: () => import("./pages/RealInterviewDetail.vue") },
    { path: "/review", component: () => import("./pages/Review.vue") },
    { path: "/retrieval", component: () => import("./pages/RetrievalPreview.vue") },
  ],
});
