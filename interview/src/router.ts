import { createRouter, createWebHistory } from "vue-router";
import InterviewHistory from "./views/InterviewHistory.vue";
import InterviewHistoryDetail from "./views/InterviewHistoryDetail.vue";
import InterviewWorkspace from "./views/InterviewWorkspace.vue";
import RetrievalPreview from "./views/RetrievalPreview.vue";
import Review from "./views/Review.vue";
import SelfIntro from "./views/SelfIntro.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: InterviewWorkspace },
    { path: "/self-intro", component: SelfIntro },
    { path: "/history", component: InterviewHistory },
    { path: "/history/:id", component: InterviewHistoryDetail },
    { path: "/review", component: Review },
    { path: "/retrieval", component: RetrievalPreview },
  ],
});
