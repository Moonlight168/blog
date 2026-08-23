import {sidebar} from "vuepress-theme-hope";
import {getBlogsSidebar} from "../presets/getBlogsSidebar.js";

export const zhSidebar = sidebar({
    "/": [
        "",
        {
            text: "我的博客",
            icon: "book",
            prefix: "blogs/",
            children: "structure",
            collapsible: true,
        },
    ],
    //"/blogs/": "structure",
    // 关键：将 /blogs/ 的侧边栏改为按时间排序的动态生成结果
    "/blogs/": "structure",
    // 面试宝典：用 structure 自动扫描 knowledge 下所有分类，
    // "答题历史"已搬到 series/ 下而非 knowledge/ 下，自动排除
    "/series/knowledge/": "structure",
    // 隐藏 series/ 下的答题历史目录（仅作为内部跳转目标，不在侧边栏展示）
    "/series/答题历史/": [],
    // 仅在开发环境生效的布局配置（private 已迁入我的项目/关于我/data/scripts）
    ...(process.env.NODE_ENV === "development"
        ? {
            "/private/finance/": "structure",
            "/private/hires/": "structure",
            "/private/实习笔记/": "structure",
            "/private/ai/": "structure",
            "/private/about/": "structure",
            "/private/series/": "structure",
            "/private/答题历史/": [],
            "/trash/": "structure",
        }
        : {}),
});