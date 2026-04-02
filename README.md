# 🌊 Pretext Ripple

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://waw666waw666.github.io/pretext-ripple/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple)](https://vitejs.dev/)

> 沉浸式文字水波纹交互体验

Pretext Ripple 是一个基于 Canvas 的交互式文字展示项目，将文本以"水下文字"的形式呈现，用户通过触摸或鼠标交互在文字表面产生逼真的水波纹效果。

## ✨ 特性

- 🎨 **沉浸式视觉体验** - 深色主题配合淡蓝色调，模拟水下光线折射效果
- 💧 **物理真实感** - 基于 2D 离散波动方程的水波纹模拟
- 🎵 **音频反馈** - Web Audio API 合成的颂钵冥想音效
- 📱 **响应式设计** - 自适应不同屏幕尺寸
- ⚡ **高性能渲染** - 视口裁剪优化，支持 60fps 流畅运行
- 🎛️ **自定义配置** - 支持自定义文本和字体大小调整

## 🚀 在线演示

**[点击体验 →](https://waw666waw666.github.io/pretext-ripple/)**

## 📦 技术栈

- **语言**: TypeScript
- **构建工具**: Vite 6.x
- **核心依赖**: [@chenglou/pretext](https://github.com/chenglou/pretext) - 智能文本排版引擎
- **部署**: GitHub Pages

## 🛠️ 本地开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 🎮 使用方法

1. **交互产生波纹** - 在屏幕上触摸或点击拖动
2. **自定义文本** - 点击右上角 ✎ 按钮，输入自定义内容
3. **调整字体大小** - 使用滑块调整字体大小（5px - 20px）
4. **智能适配** - 点击"🎯 智能适配"自动计算最佳字体大小

## 📝 配置说明

### 文本限制

- 最大输入长度: 5000 字符
- 最大渲染字符: 50000 字符（支持重复填满屏幕）

### 字体大小

- 范围: 5px - 20px
- 默认: 7px
- 动画效果会根据字体大小自动调整，确保视觉一致性

## 🏗️ 项目结构

```
pretext-ripple/
├── src/
│   ├── main.ts          # 程序入口
│   ├── text.ts          # 文本处理与字符映射
│   ├── ripple.ts        # 2D波动方程物理模拟
│   ├── renderer.ts      # Canvas渲染引擎
│   ├── input.ts         # 触摸/鼠标输入处理
│   ├── audio.ts         # Web Audio API音效系统
│   ├── sway.ts          # 文字摇摆动画
│   ├── entrance.ts      # 入场渐显动画
│   ├── gyro.ts          # 陀螺仪支持（预留）
│   └── ui.ts            # UI控制面板
├── index.html           # 页面模板
├── vite.config.ts       # Vite配置
└── .github/workflows/   # GitHub Actions部署
```

## 🔬 技术亮点

### 水波纹物理模拟

基于离散化二维波动方程：

```
∂²u/∂t² = c²∇²u - γ∂u/∂t
```

- 双缓冲技术交替计算
- 阻尼系数 0.95 实现能量耗散
- 余弦衰减实现平滑波源

### 音频合成

- **加法合成**: 基频 + 2.71x + 4.16x 泛音模拟金属钵音色
- **D大调五声音阶**: 19 个音符从 D2 到 A5
- **卷积混响**: 5 秒长混响营造空间感

### 性能优化

- 视口裁剪（Culling）- 只渲染屏幕内字符
- 智能文本重复 - 根据屏幕高度计算重复次数
- 防抖更新 - 避免频繁重建字符映射

## 📄 许可证

[MIT](LICENSE)

## 🙏 致谢

- 默认文本来自刘慈欣科幻小说《三体》
- 音频设计灵感来自颂钵冥想音乐

---

Made with 💙 by [waw666waw666](https://github.com/waw666waw666)
