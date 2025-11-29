// .vuepress/client.ts
import {defineClientConfig} from 'vuepress/client'
import GiteeRepo from './components/GiteeRepo.vue'
import {setupTransparentNavbar} from "vuepress-theme-hope/presets/transparentNavbar.js";
import Blog from "./layouts/Blog.vue";
import HoverComment from "./components/HoverComment.vue";
import {useRoute} from "vue-router";

export default defineClientConfig({
    enhance({app}) {
        app.component('GiteeRepo', GiteeRepo)

    },
    setup: () => {
        setupTransparentNavbar({type: "homepage", threshold: 50});
    },
    layouts: {
        Blog
    },


})