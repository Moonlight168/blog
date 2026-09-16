import { createRouter, createWebHistory } from "vue-router";
import InterviewHistory from "./views/InterviewHistory.vue";
import InterviewHistoryDetail from "./views/InterviewHistoryDetail.vue";
import InterviewWorkspace from "./views/InterviewWorkspace.vue";
import RealInterviewDetail from "./views/RealInterviewDetail.vue";
import ResumeEditor from "./views/ResumeEditor.vue";
import RetrievalPreview from "./views/RetrievalPreview.vue";
import Review from "./views/Review.vue";
import SelfIntro from "./views/SelfIntro.vue";

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
