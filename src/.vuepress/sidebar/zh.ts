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
/*    "/series/knowledge/": [
        {
            text: "Java",
            icon: "/assets/icon/java.png",
            prefix: "Java/",
            children: "structure" as const, // 显式声明类型
            collapsible: true, // 关键：开启折叠功能
        },
        {
            text: "关系型数据库",
            prefix: "关系型数据库/",
            children: "structure" as const, // 显式声明类型
            collapsible: true, // 关键：开启折叠功能
        },
    ],*/
    "/series/myprojects/": "structure",
/*    [
        {
            text: "淘票票",
            prefix: "淘票票/",
            children: "structure" as const, // 显式声明类型
            collapsible: true, // 关键：开启折叠功能
        },
        {
            text: "邮院通",
            prefix: "邮院通/",
            children: "structure" as const, // 显式声明类型
            collapsible: true, // 关键：开启折叠功能
        },
    ]*/
});
