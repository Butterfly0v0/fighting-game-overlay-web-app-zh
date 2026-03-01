// ==UserScript==
// @name         Fighting Game Overlay - 中文支持
// @namespace    https://fighting-game-overlay.web.app/
// @version      5.0.0
// @description  自动加载含中文支持的修改版脚本，并修正中文字体显示
// @author       Butterfly0v0
// @match        https://fighting-game-overlay.web.app/*
// @run-at       document-end
// @grant        GM_xmlhttpRequest
// @connect      cdn.jsdelivr.net
// @connect      fonts.googleapis.com
// @connect      fonts.gstatic.com
// ==/UserScript==

(function () {
  'use strict';

  // ↓↓↓ 把 YOUR_GITHUB_USERNAME 替换成你的 GitHub 用户名 ↓↓↓
  const PATCHED_JS_URL = 'https://cdn.jsdelivr.net/gh/Butterfly0v0/fighting-game-overlay-web-app-zh/index-Ca9yiikh.js';

  // ── 1. 注入中文字体 ──────────────────────────────────────────
  // 预加载 Noto Sans SC，确保汉字以简体中文字形显示
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap';
  document.head.appendChild(fontLink);

  // 注入 CSS：当语言为 zh 时，全局使用中文字体
  const style = document.createElement('style');
  style.textContent = `
    /* 切换到中文时强制使用简体中文字体 */
    :lang(zh),
    html[lang="zh"] *,
    html[lang="zh-CN"] * {
      font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei",
                   "Hiragino Sans GB", sans-serif !important;
    }

    /* 兼容网站通过 class/data 属性切换语言的情况 */
    body.lang-zh *,
    [data-lang="zh"] * {
      font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei",
                   "Hiragino Sans GB", sans-serif !important;
    }
  `;
  document.head.appendChild(style);

  // 监听语言切换，同步更新 <html lang> 属性
  // 网站用 i18next，切换语言时会触发 languageChanged 事件
  // 但因为实例私有，改为监听 localStorage 变化 + 按钮点击
  function applyZhFont(lang) {
    if (lang === 'zh') {
      document.documentElement.lang = 'zh-CN';
    }
  }

  // 初始检查
  const savedLang = localStorage.getItem('fg_overlay_lang');
  if (savedLang) applyZhFont(savedLang);

  // 监听 localStorage 变化（同标签页内切换语言时触发）
  const _setItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function(key, value) {
    _setItem(key, value);
    if (key === 'fg_overlay_lang') applyZhFont(value);
  };

  // 监听 ZH 按钮点击（fallback）
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-btn');
    if (btn && btn.textContent.trim() === 'ZH') {
      setTimeout(() => applyZhFont('zh'), 50);
    }
  });

  // ── 2. 加载修改版脚本 ────────────────────────────────────────
  console.log('[中文支持] 🔧 开始加载修改版脚本...');

  GM_xmlhttpRequest({
    method: 'GET',
    url: PATCHED_JS_URL,
    onload(res) {
      if (res.status !== 200) {
        console.error('[中文支持] ❌ 拉取失败，状态码:', res.status);
        return;
      }

      const blob = new Blob([res.responseText], { type: 'application/javascript' });
      const blobUrl = URL.createObjectURL(blob);
      const script = document.createElement('script');
      script.type = 'module';
      script.src = blobUrl;
      script.onload = () => {
        URL.revokeObjectURL(blobUrl);
        console.log('[中文支持] ✅ 执行成功');
        // 脚本执行后再次检查语言
        const lang = localStorage.getItem('fg_overlay_lang');
        if (lang) applyZhFont(lang);
      };
      script.onerror = (e) => {
        URL.revokeObjectURL(blobUrl);
        console.error('[中文支持] ❌ 执行失败:', e);
      };
      document.head.appendChild(script);
    },
    onerror(err) {
      console.error('[中文支持] ❌ 网络错误:', err);
    }
  });

})();
