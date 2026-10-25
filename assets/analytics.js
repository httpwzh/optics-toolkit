'use strict';
// Baidu Tongji integration. Only page views per tool and action names are reported;
// calculator inputs and shared-link parameters are never sent.
(() => {
  const BAIDU_ID = '0bd84dd095bb5421b968885cc74d3f28'; // Site ID from tongji.baidu.com.
  const local = location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(location.hostname);
  const optOut = navigator.doNotTrack === '1' || window.doNotTrack === '1';
  if (!/^[0-9a-f]{32}$/.test(BAIDU_ID) || local || optOut) return;

  const hmt = window._hmt = window._hmt || [];
  // Send page views manually so the URL never contains the #state=... share parameters.
  hmt.push(['_setAutoPageview', false]);
  const base = location.pathname.replace(/index\.html$/, '');
  document.addEventListener('site:track', ({detail}) => {
    const tool = String(detail.tool || '').replace(/[^a-z]/g, '');
    const action = String(detail.action || '').replace(/[^a-z-]/g, '');
    if (!tool || !action) return;
    if (action === 'view') hmt.push(['_trackPageview', base + 'tool/' + tool]);
    else hmt.push(['_trackEvent', 'tool', action, tool]);
  });
  // Pages without calculators (the guide) report a single plain page view.
  if (typeof FORMS === 'undefined') hmt.push(['_trackPageview', location.pathname]);

  // Load after the page scripts have run, so a shared #state=... is already gone from the address.
  const load = () => {
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://hm.baidu.com/hm.js?' + BAIDU_ID;
    document.head.append(s);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, {once:true});
  else load();
})();
