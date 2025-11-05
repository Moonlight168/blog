import {sidebar} from "vuepress-theme-hope";

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
    "/blogs/": "structure",
    "/series/knowledge/":"structure",
    "/series/myprojects/": "structure",
    // 仅在开发环境生效的布局配置
    ...(process.env.NODE_ENV === "development"
        ? {
            "/private/finance/": "structure",
            "/private/hires/": "structure",
        }
        : {}), // 生产环境：空对象，不添加这些配置
});
