# FaceCheck URL Discover

Chrome MV3 extension that intercepts `facecheck.id` responses to extract and open the original image URLs returned by search results.

## Features
- Context menu with two actions: open the URL in a new tab or copy it to the clipboard.
- Highlights results with an extracted URL and shows a tooltip with the link.
- Works directly on the results page of `https://facecheck.id`.

## Install from source
1. Clone the repo: `git clone https://github.com/rstlgu/facecheck-companion.git`.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select the project folder.

## Usage
- Run a search on facecheck.id.
- Right-click on a result or image: choose **Open FaceCheck URL** to open it in a new tab or **Copy FaceCheck URL** to copy it.
- Hovering over results with an extracted URL shows the 🔗 badge and a tooltip with the link.

## File structure
- `manifest.json`: MV3 configuration and permissions.
- `background.js`: builds the context menu and handles open/copy actions.
- `content.js`: injects the main-world script, tracks right-clicks, and talks to the background.
- `injected.js`: intercepts `/api/search` fetch/XHR calls, decodes base64 payloads, and fills the URL cache.
- `styles.css`: highlights results that have an extracted URL.

## Permissions
- `contextMenus`, `activeTab`, `scripting`, and host permission on `https://facecheck.id/*`, required to intercept responses and interact with the page.

