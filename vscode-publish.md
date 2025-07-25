Sure! Here's a ready-to-use `README-publish.md` (or you can rename it to `PUBLISH.md` or merge it into your main `README.md` under a "Publishing" section).

---

### 📄 `README-publish.md`

````md
# 🚀 Publishing `container-monitoring-extension` to the VSCode Marketplace

This document outlines all the steps required to publish a new version of this VSCode extension.

---

## ✅ Prerequisites

1. **Install VSCE CLI globally**
   ```bash
   npm install -g @vscode/vsce
````

2. **You must have:**

   * A verified publisher account on the [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage).
   * A valid Personal Access Token (PAT) with `Marketplace > Manage` scope.

---

## 🔁 Steps for Each Release

### 1. 🔧 Update Version

Update the version number in `package.json`:

```json
"version": "x.y.z"
```

Also update `CHANGELOG.md` and/or `build.md` if applicable.

---

### 2. ✅ Commit and Tag the Release

```bash
git add package.json CHANGELOG.md
git commit -m "chore(release): bump version to x.y.z"
git tag vX.Y.Z
git push origin master
git push origin vX.Y.Z
```

---

### 3. 📦 Package the Extension

```bash
vsce package
```

This will generate a `.vsix` file like:

```
container-monitoring-extension-x.y.z.vsix
```

---

### 4. 🔐 Authenticate to VSCE

If not already authenticated:

```bash
vsce login <your-publisher-name>
# Example:
vsce login LiveContainerMonitoring
```

Paste the **Personal Access Token** when prompted.

To replace an expired token:

```bash
vsce login LiveContainerMonitoring
# Confirm overwrite when prompted
```

---

### 5. 🚀 Publish the Extension

```bash
vsce publish x.y.z
```

Or just:

```bash
vsce publish
```

> 🔁 If you see `ECONNRESET`, switch to a stable internet connection or use a VPN and try again.

---

## 🌐 Confirm the Release

* **Marketplace Listing:**
  [View Extension on Marketplace](https://marketplace.visualstudio.com/items?itemName=LiveContainerMonitoring.container-monitoring-extension)

* **Manage Releases:**
  [Publisher Dashboard](https://marketplace.visualstudio.com/manage/publishers/LiveContainerMonitoring)

---

## 🧹 Optional Cleanup (Recommended)

### Create `.vscodeignore` to reduce extension size:

```
**/*.map
test/**
images/**
docs/**
.vscode/**
.git/**
*.md
*.log
```

### Bundle your extension for performance:

See [Bundling Guide](https://aka.ms/vscode-bundle-extension)

---

## 💡 Tips

* To install locally:

  ```bash
  code --install-extension container-monitoring-extension-x.y.z.vsix
  ```

* To automate publishing via GitHub Actions, consider using:
  [`actions/setup-node`](https://github.com/actions/setup-node)
  and
  [`actions/upload-artifact`](https://github.com/actions/upload-artifact)

---

*Last updated: July 25, 2025*

```

---

Let me know if you'd like this as a downloadable `.md` file or committed directly to your repo in a GitHub PR.
```
