import { GitContributors } from "F:/MyBlogSite/vuepress-theme-hope/my-docs/node_modules/@vuepress/plugin-git/lib/client/components/GitContributors.js";

export default {
  enhance: ({ app }) => {
    app.component("GitContributors", GitContributors);
  },
};
