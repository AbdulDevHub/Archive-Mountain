# Tampermonkey Scripts

A small collection of personal and third‑party **Tampermonkey userscripts** that tweak scrolling behavior, video display, site appearance, and navigation across popular websites.

> All scripts live in the repository root. No subfolders are used.

---

## 📦 Scripts Included

### 1. **Disable Bing Search Engine Scroll**

**File:** `Disable Bing Scroll.user.js`

* Disables scrolling on Bing search result pages.
* Prevents accidental scrolling into the Bing Chat / Copilot panel.
* **Match:** `https://www.bing.com/*`

---

### 2. **Fullscreen Toggle**

**File:** `Fullscreen Toggle.user.js`

* Toggle fullscreen mode on **any website**.
* **Shortcut:** `Shift + Alt + F`
* Works globally across all domains.

---

### 3. **Hide Scrollbar**

**File:** `Hide Scrollbar.user.js`

* Hides the active scrollbar for a cleaner UI.
* Useful for distraction‑free browsing or presentations.
* Supports HTTP, HTTPS, and local `file:///` pages.

---

### 4. **Horizontal to Vertical Scroll Remapper**

**File:** `Horizontal to Vertical Scroll Remapper.user.js`

* Converts horizontal scrolling into vertical scrolling.
* Especially useful for mice with horizontal thumb wheels (e.g. Logitech MX Master).
* Works on all websites.

---

### 5. **Sketchfab Downloader**

**File:** `Sketchfab.user.js`

* Enables downloading of Sketchfab models.
* Uses JSZip and FileSaver to package assets.
* Runs at `document-start` for reliability.

⚠️ **Note:** Respect Sketchfab’s terms of service and creators’ licenses.

---

### 6. **Video Aspect Ratio Stretcher**

**File:** `Video Aspect Ratio Stretcher.user.js`

* Dynamically stretches videos to better fill a **16:10 screen**.
* Improved aspect‑ratio detection.
* Works on most video sites.

---

### 7. **Webtoon Dark Mode**

**File:** `Webtoon Dark Mode.user.js`

* Applies a dark background to Webtoon content pages.
* Reduces eye strain during long reading sessions.
* **Match:** `https://www.webtoons.com/*`

---

### 8. **YouTube Shorts to Watch Redirect**

**File:** `YouTube Shorts to Watch Redirect.user.js`

* Automatically redirects YouTube Shorts URLs to the standard `/watch` format.
* Supports YouTube’s SPA navigation (no page refresh needed).

---

## 🛠 Installation

1. Install **Tampermonkey**:

   * Chrome / Chromium / Edge / Brave
   * Firefox

2. Open any `.user.js` file in this repository.

3. Click **Install** when Tampermonkey prompts you.

4. Ensure the script is enabled in the Tampermonkey dashboard.

---

## 🔧 Customization

Most scripts are intentionally lightweight and require no configuration.

If you want to customize behavior:

* Open the script in Tampermonkey
* Edit constants, keybindings, or CSS values
* Save and refresh the page

---

## ⚠️ Disclaimer

These scripts are provided **as‑is** with no warranty.

* Use at your own risk
* Website updates may break functionality
* Always respect website terms of service
