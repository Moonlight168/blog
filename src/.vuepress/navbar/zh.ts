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
    link: "/series/myprojects",
    icon: "/assets/icon/project.png", // 项目相关图标
    prefix: "/series/myprojects", // 项目页面存放路径前缀
    children: [
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
      { text: "招聘攻略",icon: "/assets/icon/招聘.png", link: "/series/knowledge/index.md" },
    ],
  },
  // 关于我
  {
    text: "关于我",
    icon: "/assets/icon/我.png", // 个人信息图标
    link: "/about/", // 对应 /about/README.md
  },
]);
