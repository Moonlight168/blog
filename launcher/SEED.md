# Seed 初始化说明

`seed` 用于把不进主仓库的私人资料和模型配置初始化到本机。默认目录与 `blog` 仓库同级：

```text
G:\
├── blog\
└── seed\
    ├── private\
    │   ├── resume\
    │   ├── hires\
    │   └── series\
    └── interview\
        └── .env
```

启动器按以下规则导入：

- `seed/private/` 递归合并到 `blog/src/private/`，只复制缺失文件，不覆盖本机已有内容。
- `seed/interview/.env` 合并到 `blog/interview/.env`，只补充缺失或空值，不覆盖已有非空配置。
- 密钥值不会输出到控制台或启动日志。
- `seed` 可以不存在；不存在时仍可正常启动。

需要使用其他目录时，可把目录作为启动脚本的第一个参数：

```bat
launcher\start.bat "D:\my-seed"
launcher\start-blog.bat "D:\my-seed"
```

也可以预先设置环境变量 `DESK_SEED_DIR`。命令行参数优先写入这个变量。
