import { createRouter, createWebHistory } from "vue-router";
import InterviewHistory from "./pages/InterviewHistory.vue";
import InterviewHistoryDetail from "./pages/InterviewHistoryDetail.vue";
import InterviewWorkspace from "./pages/InterviewWorkspace.vue";
import RealInterviewDetail from "./pages/RealInterviewDetail.vue";
import ResumeEditor from "./pages/ResumeEditor.vue";
import RetrievalPreview from "./pages/RetrievalPreview.vue";
import Review from "./pages/Review.vue";
import SelfIntro from "./pages/SelfIntro.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: InterviewWorkspace },
    { path: "/resume", component: ResumeEditor },
    { path: "/self-intro", component: SelfIntro },
    { path: "/history", component: InterviewHistory },
    { path: "/history/:id", component: InterviewHistoryDetail },
    { path: "/real-interview/:id", component: RealInterviewDetail },
    { path: "/review", component: Review },
    { path: "/retrieval", component: RetrievalPreview },
  ],
});
