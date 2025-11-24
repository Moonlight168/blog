import {defineUserConfig} from "vuepress";
import theme from "./theme.js";
import {getDirname, path} from 'vuepress/utils'
import {registerComponentsPlugin} from "@vuepress/plugin-register-components";
import {slimsearchPlugin} from "@vuepress/plugin-slimsearch"
import {hopeTheme} from "vuepress-theme-hope";

const __dirname = import.meta.dirname || getDirname(import.meta.url)
const componentsDir = path.resolve(__dirname, 'components');

export default defineUserConfig({
    base: "/",
    lang: "zh-CN",
    theme: theme,
    port: 8888,

    plugins: [
        registerComponentsPlugin({
            componentsDir: componentsDir
        }),
        slimsearchPlugin({
            // 搜索框占位符（可自定义）
            locales: {
                "/": {
                    placeholder: "搜索文章/笔记...",

                },
            },
            indexContent: true, // 开启全文搜索（slimsearch 核心特性）
            hotReload: true, // 开发模式热重载索引（避免缓存）
            hotKeys: [{key: "k", ctrl: true}, {key: "/", ctrl: true}], // 保留你的热键
        }),
    ],
    head: [
        [
            'script', {}, `
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?4854a35f85e77afdd57bc6802b616bde";
        var s = document.getElementsByTagName("script")[0]; 
        s.parentNode.insertBefore(hm, s);
      })();
    `]
    ],

});

