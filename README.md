# macOS 桌面复刻 · HTML + CSS + JS

用原生 HTML / CSS / JavaScript 高保真复刻 macOS 桌面体验，无需任何框架与构建工具。
本项目采用多文件结构（便于阅读与二次开发），**仓库根目录即 GitHub Pages 站点根目录**。

## 目录结构

```
├── index.html            入口（引用 css/ 与 js/）
├── css/
│   ├── base.css          设计令牌、开机/登录、桌面、菜单栏、系统组件
│   ├── windows.css       窗口、Dock、启动台、控制中心、聚焦搜索
│   └── apps.css          各应用界面样式与响应式适配
└── js/
    ├── 01-core.js        工具函数、主题/壁纸、时钟、虚拟文件系统、图标
    ├── 02-window.js      窗口管理器与 Dock
    ├── 03-finder-safari.js   访达、Safari
    ├── 04-terminal-calc.js   终端、计算器
    ├── 05-social.js      备忘录、信息、邮件、日历、音乐
    ├── 06-system-apps.js 照片、文本编辑、系统设置、废纸篓、关于本机
    └── 07-ui.js          启动台、控制中心、菜单栏、聚焦、电源、初始化
```

## 功能一览

- 开机动画 → 登录界面（默认密码 `123456`，可在系统设置中修改）→ 桌面
- 顶部菜单栏（Apple 菜单、应用菜单、控制中心、聚焦搜索、时钟、Wi-Fi、电池）
- 底部 Dock：悬停放大、运行指示点、点击切换窗口
- 窗口管理器：拖拽、八向缩放、最小化、最大化、关闭、焦点层级
- 应用：访达、Safari、备忘录、信息、邮件、照片、日历、音乐、终端、
  计算器、文本编辑、系统设置、废纸篓、关于本机
- 系统设置：深色 / 浅色模式、强调色、墙纸切换、修改登录密码
- 启动台、聚焦搜索（`Cmd+空格`）、右键菜单、自定义 macOS 风格鼠标指针
- Safari 内嵌浏览器：支持内嵌的网站（wikipedia.org、openstreetmap.org、
  baidu.com、example.com）直接在窗口内浏览；被禁止内嵌的网站提示后可新窗口打开
- 苹果设备直接使用 字符渲染苹果标志，其余设备使用内联 SVG
- 快捷键：`Cmd+空格` 聚焦 · `Cmd+W` 关窗 · `Cmd+M` 最小化 · `Cmd+Q` 退出

## 启用 GitHub Pages

仓库 **Settings → Pages → Build and deployment → Source 选 `Deploy from a branch` →
Branch 选 `main` / `root` → Save**。约 1 分钟后访问：

```
https://<用户名>.github.io/macos-clone/
```

浏览器地址加 `?desktop` 可跳过开机动画直达桌面。

## 说明

- 界面参考 macOS 公开交互规范并独立实现，未抄袭任何开源项目代码。
- 壁纸走远程图片（网络加载），其余功能离线可用；数据（备忘录、文本、
  密码、设置）保存在浏览器 localStorage。
- 本产物为 macOS 桌面的前端复刻演示，非真实系统；终端与访达操作的是
  内置的演示文件系统。
