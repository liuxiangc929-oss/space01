<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/1e7ad458-2f94-4ea3-8f40-40d454a05e7a

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## 更新记录

本次项目初始化和配置完成了以下几项工作：

1. **依赖升级与调整**: 在 `package.json` 中配置了 `@types/react` 和 `@types/react-dom`，补充了项目在 TypeScript 下对应的 React 类型定义以保证类型安全。
2. **自动化部署 (GitHub Action)**: 添加了 `.github/workflows/deploy.yml` 文件。项目通过 Vite 构建支持自动将成果部署到 **GitHub Pages**。只要有新的代码推送（`PUSH`）到 `main` 分支，系统将自动触发在线构建和发布动作。
3. **版本控制忽略 (.gitignore)**: 在项目目录下创建了规范的 `.gitignore` 模板文件，以避免提交 `node_modules/`、`dist/` 临时产物，以及 `.env` 等敏感环境变量文件入库。

> **提示:** 当前终端未检测到 `npm` 环境。请确保通过上文配置的 `nvm use <version>` 启用正确的 Node 环境，或者在安装完 `nvm` 后尝试**完全关闭并重新打开此终端**，然后依次执行 `npm install` 及 `npm run dev` 测试项目。
