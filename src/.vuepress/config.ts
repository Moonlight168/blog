import { defineUserConfig } from "vuepress";
import theme from "./theme.js";
import { getDirname, path } from 'vuepress/utils'
import {registerComponentsPlugin} from "@vuepress/plugin-register-components";

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

