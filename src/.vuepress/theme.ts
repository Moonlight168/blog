import { hopeTheme } from "vuepress-theme-hope";
import { zhNavbar } from "./navbar/index.js";
import {  zhSidebar } from "./sidebar/index.js";
import GiteeRepo from "./components/GiteeRepo.vue";
export default hopeTheme({
  author: {
    name: "GGBOND",
    url: "https://mister-hope.com",
  },
  //是否显示页面最后更新时间
  lastUpdated: true,
  // 是否显示页面贡献者，支持 content、meta 和 boolean
  contributors: true,
  // 是否展示编辑此页链接
  editLink: true,
  // 是否显示变更日志
  changelog: false,

  navbarLayout: {
    start: ["Brand"],
    center: ["Links"],
    end: ["Language", "Repo","GiteeRepo", "Outlook", "Search"],
  },

  // 修改repo配置为您的GitHub仓库
  repo: "Moonlight168",
  // 设置repo标签显示为GitHub
  repoLabel: "GitHub",


  docsDir: "src",
  docsRepo: "blog",

  blog: {
    avatar: "/assets/logo/ggbond.png",
    medias: {
      Gitee: "https://gitee.com/wish168/projects?sort=&scope=&state=public",
      GitHub: "https://github.com/Moonlight168?tab=repositories",
    },
  },

  locales: {
    /**
     * Chinese locale config
     */

    "/": {
      //自定义博客标签
/*      blogLocales: {
        article: "博客",
        articleList: "文章列表",
        category: "分类",
        tag: "标签",
        timeline: "时间轴", // 将 Timeline 改为「时间轴」
        all: "全部",
        intro: "个人介绍",
        star: "星标文章",
      },*/

      // navbar
       navbar: zhNavbar,

      // sidebar
      sidebar: zhSidebar,

      //footer: "默认页脚",

      displayFooter: true,

      // page meta
      metaLocales: {
        editLink: "在 GitHub 上编辑此页",
      },
    },
  },

  encrypt: {
    config: {
      "demo/encrypt.html": {
        hint: "Password: 1234",
        password: "1234",
      },
    },
  },

  // enable it to preview all changes in time
  // hotReload: true,

  // These features are enabled for demo, only preserve features you need here
  markdown: {
    align: true,
    attrs: true,
    codeTabs: true,
    component: true,
    demo: true,
    figure: true,
    gfm: true,
    imgLazyload: true,
    imgSize: true,
    include: true,
    mark: true,
    plantuml: true,
    spoiler: true,
    mermaid: true,
    flowchart: true,
    stylize: [
      {
        matcher: "Recommended",
        replacer: ({ tag }) => {
          if (tag === "em")
            return {
              tag: "Badge",
              attrs: { type: "tip" },
              content: "Recommended",
            };
        },
      },
    ],
    sub: true,
    sup: true,
    tabs: true,
    tasklist: true,
    vPre: true,
  },

  plugins: {
    blog: true,
    components: {
      components: ["Badge", "VPCard"],
    },

    icon: {
      prefix: "fa6-solid:",
    },

    catalog: true,

    // 添加搜索插件配置
    search: {
      // 本地搜索
      hotKeys: [{ key: "k", ctrl: true }, { key: "/", ctrl: true }],
      locales: {
        "/": {
          placeholder: "搜索",
        },
      },
    },
  }
})