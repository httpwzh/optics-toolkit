'use strict';
// Baidu Tongji usage events. The official hm.js snippet lives inline in each page <head>
// (Baidu's install checker requires it there). This file only forwards action + tool names;
// calculator inputs and shared-link parameters are never sent.
(() => {
  if (!window.__analytics) return; // Analytics not loaded (local preview or Do Not Track).
  const base = location.pathname.replace(/index\.html$/, '');
  document.addEventListener('site:track', ({detail}) => {
    const tool = String(detail.tool || '').replace(/[^a-z]/g, '');
    const action = String(detail.action || '').replace(/[^a-z-]/g, '');
    if (!tool || !action) return;
    if (action === 'view') _hmt.push(['_trackPageview', base + 'tool/' + tool]);
    else _hmt.push(['_trackEvent', 'tool', action, tool]);
  });
})();
