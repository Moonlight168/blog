import {sidebar} from "vuepress-theme-hope";
import {getBlogsSidebar} from "../presets/getBlogsSidebar.js";
export const zhSidebar = sidebar({
    "/": [
        "",
        {
            text: "我的博客",
            icon: "book",
            prefix: "blogs/",
            children: "structure", // 显式声明类型
            collapsible: true, // 关键：开启折叠功能
        },
        {
            text: "剑指OFFER",
            icon: "award",
            prefix: "series/knowledge/",
            children: "structure", // 显式声明类型
            collapsible: true, // 关键：开启折叠功能
        },
        "about/README.md",
    ],
    //"/blogs/": "structure",\
    // 关键：将 /blogs/ 的侧边栏改为按时间排序的动态生成结果
    // 关键：将 /blogs/ 的侧边栏改为按时间排序的动态生成结果
    "/blogs/": "structure",
    "/series/knowledge/":"structure",
    "/series/myprojects/": "structure",
    // 仅在开发环境生效的布局配置
    ...(process.env.NODE_ENV === "development"
        ? {
            "/private/finance/": "structure",
            "/private/hires/": "structure",
            "/trash/": "structure",
        }
        : {}), // 生产环境：空对象，不添加这些配置
     // 排除不想显示的目录（无论在什么环境都不显示）
    //"/blogs/基本概念/UML建模/结构图/": [],
});
