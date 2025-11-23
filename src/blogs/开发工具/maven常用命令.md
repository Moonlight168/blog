---
title: "Maven 常用命令详解"
icon: /assets/icon/maven.png
order: 2
---

删除 target 目录及其内容，清理之前的构建结果。
```bash
mvn clean
```

编译项目的主源码，将 src/main/java 下的代码编译到 target/classes 目录。
```bash
mvn compile
```

编译测试代码，将 src/test/java 下的代码编译到 target/test-classes 目录。
```bash
mvn test-compile
```

执行单元测试，运行 src/test/java 下的所有测试用例。
```bash
mvn test
```

将项目打包成 jar、war 等格式，默认位于 target 目录下。
```bash
mvn package
```

将项目打包并安装到本地 Maven 仓库，供其他项目使用。
```bash
mvn install
```

将项目打包并部署到远程 Maven 仓库。
```bash
mvn deploy
```

显示项目的依赖关系树，帮助排查依赖冲突。
```bash
mvn dependency:tree
```

分析项目依赖，识别未使用的依赖和声明但未使用的依赖。
```bash
mvn dependency:analyze
```

将项目依赖复制到 target/dependency 目录。
```bash
mvn dependency:copy-dependencies
```

详细显示特定依赖的冲突情况，帮助定位和解决依赖冲突。
```bash
mvn dependency:tree -Dverbose -Dincludes=groupId:artifactId

# 查询某依赖
mvn dependency:tree | grep -i jsqlparser -n
```

查看插件帮助。
```bash
mvn plugin:help -Dplugin=pluginName
```

执行特定插件目标。
```bash
mvn pluginPrefix:goal
```

编译插件。
```bash
mvn compiler:compile
```

资源插件。
```bash
mvn resources:resources
```

Surefire 插件（测试）。
```bash
mvn surefire:test
```

清理并编译。
```bash
mvn clean compile
```

清理并测试。
```bash
mvn clean test
```

清理并打包。
```bash
mvn clean package
```

清理并安装到本地仓库。
```bash
mvn clean install
```

跳过测试。
```bash
mvn clean package -DskipTests
mvn clean package -Dmaven.test.skip=true
```

指定配置文件。
```bash
mvn clean package -P profileName
```

查看 Maven 版本。
```bash
mvn -v
mvn --version
```

显示项目属性或查看实际生效的 pom。
```bash
mvn help:effective-pom
```

查看系统属性。
```bash
mvn help:system
```

强制更新依赖。
```bash
mvn clean install -U
mvn clean install --update-snapshots
```

离线模式。
```bash
mvn clean install -o
mvn clean install --offline
```

静默模式。
```bash
mvn clean install -q
mvn clean install --quiet
```

调试模式。
```bash
mvn clean install -X
mvn clean install --debug
```

查看详细输出。
```bash
mvn clean install -e
mvn clean install --errors
```

并行构建。
```bash
mvn clean install -T 4
mvn clean install -T 1C
```

依赖下载失败时强制更新。
```bash
mvn clean install -U
```

手动删除 `~/.m2/repository` 中对应的依赖目录，然后重新构建。

-pl 指定构建目标模块（flowmind-monitor）
-am 自动构建目标模块依赖的所有模块（如 flowmind-common-core）
```bash
mvn clean install -pl flowmind-monitor -am
```