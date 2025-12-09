import { navbar } from "vuepress-theme-hope";

export const zhNavbar = navbar([
  // 主页（链接到中文首页）
  {
    text: "主页",
    icon: "/assets/icon/首页.png", // 主页图标
    link: "/",
  },
  // 我的项目（一级导航，可包含子项）
  {
    text: "我的项目",
    icon: "/assets/icon/project.png", // 项目相关图标
    prefix: "/series/myprojects", // 项目页面存放路径前缀
    children: [
      {
        text: "项目总览",
        icon: "/assets/icon/myprojects.png",
        link: "/series/myprojects/",
      },
      {
        text: "FlowMind",
        icon: "/assets/icon/cloud_flow.png",
        link: "FlowMind/",
      },
      {
        text: "淘票票",
        icon: "/assets/icon/淘票票icon.png",
        link: "淘票票/",
      },
      {
        text: "邮院通",
        icon: "/assets/icon/校园.png",
        link: "邮院通/",
      },
    ],
  },
  // 博客（一级导航，按分类组织）
  {
    text: "博客",
    icon: "/assets/icon/写博客.png", // 博客图标
    prefix: "/blogs/", // 博客文章存放路径前缀
    children: [{
        text: "技术分享",
        icon: "/assets/icon/技术分享.png",
        link: "/blogs/",
      },
      {
        text: "开发工具",
        icon: "/assets/icon/开发工具.png",
        link: "/category/开发工具/",
      },
      {
        text: "BUG",
        icon: "/assets/icon/bug.png",
        link: "/category/bug/",
      },
      {
        text: "开源项目分享",
        icon: "/assets/icon/开源.png",
        link: "/category/开源项目/",
      },
    ],
  },
  // 成长轨迹
  {
    text: "成长轨迹",
    icon: "/assets/icon/轨迹.png", // 成长/进度图标
    link: "/timeline/",
  },
  // 剑指offer（算法/面试相关）
  {
    text: "剑指offer",
    icon: "/assets/icon/award.png", // 面试/算法图标
    prefix: "/series/knowledge/",
    children: [
      { text: "面试宝典",icon: "/assets/icon/书本.png", link: "/series/knowledge/index.md" },
      ...(process.env.NODE_ENV === "development"
          ? [{ text: "寻找Offer",icon: "/assets/icon/招聘.png", link: "/private/hires/README.md" }] // 本地显示
          : []),
    ],
  },
  // 私有导航项（仅本地开发时显示）
  ...(process.env.NODE_ENV === "development"
      ? [
          { text: "投资理财", icon: "/assets/icon/finance.png", link: "/private/finance/README.md" }, // 本地显示
          { 
            text: "人工智能", 
            icon: "/assets/icon/ai.png",  
            prefix: "/private/ai/",
            children: [
              { text: "AI发展历史", link: "/private/ai/AI发展历史.md" }
            ]
          }
        ] // 本地显示
      : []), // 构建时不显示
      
  // 关于我
  {
    text: "关于我",
    icon: "/assets/icon/我.png", // 个人信息图标
    link: "/about/", // 对应 /about/README.md
  },

]);
