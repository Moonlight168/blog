import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/article/开发工具/破解安卓应用.html.vue"
const data = JSON.parse("{\"path\":\"/article/%E5%BC%80%E5%8F%91%E5%B7%A5%E5%85%B7/%E7%A0%B4%E8%A7%A3%E5%AE%89%E5%8D%93%E5%BA%94%E7%94%A8.html\",\"title\":\"破解 Android 应用会员逻辑\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"破解 Android 应用会员逻辑\",\"date\":\"2025-06-03T00:00:00.000Z\",\"categories\":[\"开发工具\"],\"tags\":[\"Android\"]},\"readingTime\":{\"minutes\":3.22,\"words\":965},\"filePathRelative\":\"article/开发工具/破解安卓应用.md\",\"excerpt\":\"<blockquote>\\n<p>⚠️ <strong>免责声明：本教程仅供学习 Android 安全和逆向工程知识，请勿用于商业破解或任何违法行为。若用于非法目的，后果自负！</strong></p>\\n</blockquote>\\n<h2>🧰 工具准备</h2>\\n<table>\\n<thead>\\n<tr>\\n<th>工具</th>\\n<th>说明</th>\\n<th>下载地址</th>\\n</tr>\\n</thead>\\n<tbody>\\n<tr>\\n<td>🔹 Java JDK（8+）</td>\\n<td>用于运行 apktool 和签名 APK</td>\\n<td><a href=\\\"https://www.oracle.com/java/technologies/javase-downloads.html\\\" target=\\\"_blank\\\" rel=\\\"noopener noreferrer\\\">Oracle JDK</a> 或 <a href=\\\"https://jdk.java.net/\\\" target=\\\"_blank\\\" rel=\\\"noopener noreferrer\\\">OpenJDK</a></td>\\n</tr>\\n<tr>\\n<td>🔹 Apktool</td>\\n<td>用于反编译 / 回编译 APK</td>\\n<td><a href=\\\"https://ibotpeaches.github.io/Apktool/\\\" target=\\\"_blank\\\" rel=\\\"noopener noreferrer\\\">Apktool 官网</a></td>\\n</tr>\\n<tr>\\n<td>🔹 Frida-dexdump</td>\\n<td>用于动态脱壳</td>\\n<td><a href=\\\"https://github.com/hluwa/frida-dexdump\\\" target=\\\"_blank\\\" rel=\\\"noopener noreferrer\\\">GitHub - frida-dexdump</a></td>\\n</tr>\\n<tr>\\n<td>🔹 Jadx GUI</td>\\n<td>将 APK 转换为 Java 源码</td>\\n<td><a href=\\\"https://github.com/skylot/jadx\\\" target=\\\"_blank\\\" rel=\\\"noopener noreferrer\\\">Jadx GitHub</a></td>\\n</tr>\\n<tr>\\n<td>🔹 ADB 工具</td>\\n<td>安装 APK 到 Android 手机</td>\\n<td><a href=\\\"https://developer.android.com/studio/releases/platform-tools\\\" target=\\\"_blank\\\" rel=\\\"noopener noreferrer\\\">Platform Tools</a></td>\\n</tr>\\n</tbody>\\n</table>\"}")
export { comp, data }

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updatePageData) {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ data }) => {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  })
}
