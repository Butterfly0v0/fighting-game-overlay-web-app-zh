// ==UserScript==
// @name         Fighting Game Overlay - 中文支持
// @namespace    https://fighting-game-overlay.web.app/
// @version      2.0.0
// @description  自动加载含中文支持的修改版脚本
// @author       You
// @match        https://fighting-game-overlay.web.app/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @connect      cdn.jsdelivr.net
// ==/UserScript==

(function () {
  'use strict';

  // ↓↓↓ 把 YOUR_GITHUB_USERNAME 替换成你的 GitHub 用户名 ↓↓↓
  const PATCHED_JS_URL = 'https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/fgo-zh@main/index-Ca9yiikh.js';
  const ORIGINAL_JS_PATTERN = /\/assets\/index-Ca9yiikh\.js/;

  // 拦截所有 <script> 标签的插入
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.tagName === 'SCRIPT' && node.src && ORIGINAL_JS_PATTERN.test(node.src)) {
          // 找到目标 script，阻止原始加载
          node.type = 'javascript/blocked';

          // 用 GM_xmlhttpRequest 绕过跨域限制，加载修改版 JS
          GM_xmlhttpRequest({
            method: 'GET',
            url: PATCHED_JS_URL,
            onload: (res) => {
              const script = document.createElement('script');
              script.textContent = res.responseText;
              node.parentNode.insertBefore(script, node.nextSibling);
              node.remove();
              console.log('[中文支持] ✅ 修改版脚本加载成功');
            },
            onerror: (err) => {
              // 加载失败时恢复原始脚本，保证网站正常运行
              console.warn('[中文支持] ⚠️ 修改版加载失败，回退到原始版本', err);
              node.type = 'text/javascript';
            }
          });
        }
      }
    }
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });

})();
