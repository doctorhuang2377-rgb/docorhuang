# 肺癌 TNM 分期助手 (Lung Cancer TNM Helper)

这是一个基于 **PWA (Progressive Web App)** 技术的肺癌 TNM 分期计算工具，支持 IASLC/UICC 第 8 版标准。

## 功能特点
*   **TNM 分期计算**：交互式选择 T/N/M，自动计算临床分期。
*   **智能分析**：粘贴病理或影像学报告文本，自动提取 TNM 信息并生成分期。
*   **详细定义**：提供各项指标的详细医学定义。
*   **生存率参考**：显示对应分期的 5 年生存率数据。
*   **离线可用**：支持添加到手机主屏幕，无网环境下也能使用。
*   **数据保存**：本地保存计算历史，生成文本报告。

## 如何部署到 GitHub Pages

由于本项目是纯静态网页，您可以免费将其部署到 GitHub Pages，获得一个永久访问链接。

### 第一步：准备代码
如果您是在本地开发，请确保已安装 Git。如果未安装，您可以直接在 GitHub 网页上操作（上传文件）。

### 第二步：创建 GitHub 仓库
1.  登录 [GitHub](https://github.com/)。
2.  点击右上角的 **+** 号，选择 **New repository**。
3.  **Repository name** 输入 `lung-cancer-tnm-helper` (或任意名称)。
4.  保持为 **Public** (免费版 Pages 通常需要公开仓库)。
5.  点击 **Create repository**。

### 第三步：推送代码
在您的本地项目目录中打开终端（Terminal / PowerShell），执行以下命令（将 URL 替换为您刚才创建的仓库地址）：

```bash
# 1. 初始化 Git (如果尚未初始化)
git init

# 2. 添加所有文件
git add .

# 3. 提交代码
git commit -m "Initial commit"

# 4. 关联远程仓库 (请替换为您自己的仓库地址)
git remote add origin https://github.com/YOUR_USERNAME/lung-cancer-tnm-helper.git

# 5. 推送代码
git push -u origin master
```

### 第四步：开启 GitHub Pages
1.  回到 GitHub 仓库页面。
2.  点击上方的 **Settings** (设置) 选项卡。
3.  在左侧菜单中找到 **Pages**。
4.  在 **Build and deployment** > **Source** 下，选择 **Deploy from a branch**。
5.  在 **Branch** 下，选择 `master` (或 `main`) 分支，文件夹选择 `/(root)`。
6.  点击 **Save**。

### 第五步：获取链接
保存后，页面顶部会显示：
> GitHub Pages source saved.

等待几分钟（通常 1-2 分钟），刷新该页面，您将看到：
> **Your site is live at https://your-username.github.io/lung-cancer-tnm-helper/**

点击该链接即可访问您的 APP！

## 如何在手机上安装
1.  使用手机浏览器（Safari / Chrome）打开上述链接。
2.  点击浏览器的 **分享** 按钮 (iOS) 或 **菜单** 按钮 (Android)。
3.  选择 **添加到主屏幕** (Add to Home Screen)。
4.  现在，您可以像原生 APP 一样从桌面启动它了！
