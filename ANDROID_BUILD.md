# 📱 Android App 构建指南 (使用 Capacitor)

本指南将教你如何将 AniLearn 网页应用打包成安装在安卓手机上的 APK 文件。

## 📋 前置准备

在开始之前，请确保你的电脑上安装了以下软件：

1.  **Node.js** (已安装)
2.  **Android Studio** (必须): [下载地址](https://developer.android.com/studio)
    *   安装后，打开 Android Studio，进入 **SDK Manager**，确保安装了 **Android SDK Platform** 和 **Android SDK Build-Tools**。
3.  **Java JDK** (通常 Android Studio 会自带，如果没有请安装 JDK 17)。

---

## 🚀 构建步骤

### 第一步：构建 Web 项目

首先，我们需要将 React 代码编译成静态的 HTML/CSS/JS 文件。

```bash
npm run build
```
*(注：构建生成的文件夹通常是 `dist` 或 `build`。请确认你的项目根目录下生成了这个文件夹。)*

### 第二步：安装 Capacitor

在项目根目录下运行以下命令安装 Capacitor 核心库和安卓平台支持：

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### 第三步：初始化 Capacitor

初始化项目配置。

```bash
npx cap init
```
*   **App Name**: 输入 `AniLearn`
*   **App Package ID**: 输入类似 `com.anilearn.app` 的唯一标识符。
*   **Web asset directory**: 输入你第一步构建生成的目录名（通常是 `dist` 或 `build`）。**这一点非常重要！**

### 第四步：添加 Android 平台

```bash
npx cap add android
```

### 第五步：同步代码

每次你运行 `npm run build` 更新了网页代码后，都需要运行这个命令将代码同步到安卓项目中：

```bash
npx cap sync
```

### 第六步：关于 API Key 的重要说明 ⚠️

由于打包成 App 后，无法像网页开发那样通过 `.env` 读取环境变量。你需要确保你的 Google Gemini API Key 能被代码访问到。

**临时/个人使用方案：**
在 `src/constants.ts` (或类似文件) 中，找到初始化 AI 的地方，或者直接硬编码你的 Key（注意：不要将带 Key 的代码上传到公开 GitHub 仓库）。

```typescript
// 示例：确保代码中能获取到 Key
const API_KEY = "你的_GOOGLE_GEMINI_API_KEY";
```

### 第七步：在 Android Studio 中打开并构建

运行以下命令，它会自动打开 Android Studio：

```bash
npx cap open android
```

1.  等待 Android Studio 加载项目并完成 **Gradle Sync**（右下角会有进度条，第一次可能需要几分钟下载依赖）。
2.  **连接手机**：
    *   用 USB 线连接你的安卓手机。
    *   确保手机已开启**开发者模式**和**USB 调试**。
3.  **运行 App**：
    *   在 Android Studio 顶部工具栏，选择你的手机设备。
    *   点击绿色的 ▶️ (Run) 按钮。
    *   Android Studio 会编译应用并自动安装到你的手机上。

### 第八步：生成 APK 文件 (分享给他人)

如果你想生成一个 APK 文件发给朋友安装：

1.  在 Android Studio 菜单栏中，点击 **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**。
2.  构建完成后，右下角会提示 "APK(s) generated successfully"。
3.  点击提示中的 **locate**，你就会看到 `.apk` 文件了。

---

## 常见问题 (FAQ)

**Q: App 打开后白屏？**
*   检查 `capacitor.config.json` 中的 `webDir` 是否正确指向了构建目录（如 `dist`）。
*   检查 `index.html` 中的资源引用路径。通常需要确保引用路径是相对路径（如 `./assets/...`）而不是绝对路径（`/assets/...`）。

**Q: 需要联网吗？**
*   **是的**。由于本应用使用了 Google Gemini AI，且部分 React 依赖是通过 CDN 引入的（如果未完全本地打包），手机必须连接互联网才能正常运行。

**Q: 底部会有安全区域留白吗？**
*   代码中已经添加了 `safe-area-inset` 支持，并且在 `index.html` 中配置了 `viewport-fit=cover`，应该能完美全屏显示。
