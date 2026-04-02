# 🌊 Pretext Ripple

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen?style=flat-square&logo=github)](https://waw666waw666.github.io/pretext-ripple/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> 沉浸式文字水波纹交互体验 —— 让文字像水面一样流动

[🚀 在线体验](https://waw666waw666.github.io/pretext-ripple/) · [📦 源码](https://github.com/waw666waw666/pretext-ripple) · [🐛 问题反馈](https://github.com/waw666waw666/pretext-ripple/issues)

---

## ✨ 效果预览

![Pretext Ripple 演示](./docs/demo.gif)

在文字表面轻触或滑动，即可产生逼真的水波纹效果，配合空灵的颂钵音效，带来沉浸式的交互体验。

> 💡 **提示**: 推荐使用耳机以获得最佳音效体验

---

## 🎯 核心特性

| 特性 | 说明 |
|------|------|
| 🎨 **沉浸式视觉** | 深色主题配合淡蓝光线，模拟水下折射效果 |
| 💧 **物理模拟** | 基于 2D 离散波动方程的真实水波纹计算 |
| 🎵 **空间音效** | Web Audio API 合成颂钵音色 + 卷积混响 |
| 📱 **全端适配** | 响应式设计，支持桌面和移动设备 |
| ⚡ **高性能** | 60fps 流畅运行，视口裁剪优化 |
| 🎛️ **自由定制** | 自定义文本内容、字体大小智能适配 |

---

## 🚀 快速开始

### 在线体验

无需安装，直接访问：

**👉 https://waw666waw666.github.io/pretext-ripple/**

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/waw666waw666/pretext-ripple.git
cd pretext-ripple

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

---

## 🎮 使用指南

### 基础交互

| 操作 | 效果 |
|------|------|
| 🖱️ **鼠标移动/点击** | 在文字表面产生水波纹 |
| 📱 **触摸滑动** | 移动端同样支持波纹效果 |
| ✨ **自动波纹** | 随机位置自动生成涟漪 |

### 自定义设置

点击右上角的 **✎ 编辑按钮** 打开控制面板：

1. **📝 自定义文本** - 输入任意内容（支持 5000 字符）
2. **🔤 调整字体** - 滑块控制 5px ~ 20px
3. **🎯 智能适配** - 一键计算最佳字体大小填满屏幕

---

## 🏗️ 技术架构

### 项目结构

```
src/
├── main.ts          # 程序入口，模块协调
├── text.ts          # 文本处理、字符映射、重复填充
├── ripple.ts        # 2D波动方程物理引擎
├── renderer.ts      # Canvas渲染、动画循环
├── input.ts         # 鼠标/触摸事件处理
├── audio.ts         # Web Audio API音效合成
├── sway.ts          # 文字摇摆动画
├── entrance.ts      # 入场渐显动画
├── gyro.ts          # 陀螺仪支持（预留）
└── ui.ts            # UI控制面板交互
```

### 核心技术

#### 1. 水波纹物理引擎

基于离散化二维波动方程：

```
∂²u/∂t² = c²∇²u - γ∂u/∂t
```

实现细节：
- **双缓冲技术** - 交替计算当前帧和下一帧
- **阻尼系数 0.95** - 模拟能量自然耗散
- **余弦衰减** - 波源扩散更平滑自然

#### 2. 音频合成系统

| 参数 | 配置 |
|------|------|
| 合成方式 | 加法合成 |
| 泛音比例 | 基频 + 2.71x + 4.16x |
| 音阶 | D大调五声音阶（D2 ~ A5，共19音）|
| 混响 | 5秒卷积混响，营造空间感 |

#### 3. 性能优化策略

- ✅ **视口裁剪** - 仅渲染屏幕可见字符
- ✅ **智能重复** - 根据屏幕高度自动计算文本重复次数
- ✅ **防抖更新** - 避免频繁重建字符映射表
- ✅ **对数动画曲线** - 大字体下保持动画一致性

---

## ⚙️ 配置参数

### 文本限制

| 参数 | 值 | 说明 |
|------|-----|------|
| `MAX_TEXT_LENGTH` | 5000 | 用户输入最大长度 |
| `MAX_CHARS_RENDER` | 50000 | 渲染字符上限（含重复填充）|
| `PADDING` | 20px | 文字边距 |

### 字体设置

| 参数 | 范围 | 默认值 |
|------|------|--------|
| 字体大小 | 5px ~ 20px | 7px |
| 行高 | 1.5em | - |
| 字间距 | 0.05em | - |

---

## 🛠️ 开发计划

- [ ] 移动端触摸优化
- [ ] 添加更多预设文本
- [ ] 音效开关控制
- [ ] 波纹强度调节
- [ ] 主题颜色切换
- [ ] 项目截图/GIF

---

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 📄 许可证

本项目基于 [MIT](LICENSE) 许可证开源。

---

## 🙏 致谢

- 默认文本节选自刘慈欣科幻小说《三体》
- 音频设计灵感源自颂钵冥想音乐
- 波纹算法参考经典 2D Wave Equation 实现

---

<p align="center">
  Made with 💙 by <a href="https://github.com/waw666waw666">waw666waw666</a>
</p>

<p align="center">
  <a href="https://waw666waw666.github.io/pretext-ripple/">🌊 体验水波纹魔法</a>
</p>
