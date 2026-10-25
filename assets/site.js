'use strict';
(() => {
  const keys = Object.keys(FORMS);
  const active = () => document.querySelector('.tab.active').dataset.tab;
  const status = document.createElement('p');
  status.className = 'site-status'; status.setAttribute('role', 'status');
  document.querySelector('.tabs').after(status);
  const tell = text => { status.textContent = text; };
  const initial = {};
  keys.forEach(k => { initial[k] = {}; fieldsOf(FORMS[k].form).forEach(e => { if (e.id in defaults) initial[k][e.id] = defaults[e.id]; }); });
  function snapshot(k) {
    const values = {};
    fieldsOf(FORMS[k].form).forEach(e => { if (e.id) values[e.id] = e.value; });
    return {version:1, tool:k, values, ...(k === 'multi' ? {lenses:readLenses()} : {})};
  }
  function validate(s) {
    if (!s || s.version !== 1 || !keys.includes(s.tool) || !s.values || typeof s.values !== 'object' || Array.isArray(s.values)) throw Error('链接版本或工具无效');
    const allowed = initial[s.tool];
    for (const [id,v] of Object.entries(s.values)) {
      const e = document.getElementById(id);
      if (!Object.hasOwn(allowed,id) || !e || typeof v !== 'string' || v.length > 80) throw Error('参数字段无效');
      if (e.tagName === 'SELECT' && ![...e.options].some(o => o.value === v)) throw Error('选项无效');
      if (e.type === 'number' && (v.trim() === '' || !Number.isFinite(Number(v)))) throw Error('数值无效');
    }
    if (s.tool === 'multi') {
      if (!Array.isArray(s.lenses) || s.lenses.length < 1 || s.lenses.length > ML_MAX) throw Error('元件数量无效');
      s.lenses.forEach(l => {
        if (!l || !Object.hasOwn(ML_TYPES,l.t) || !['h','v'].includes(l.ax) || !['f','d','ap','th','rf'].every(p => typeof l[p] === 'number' && Number.isFinite(l[p]))) throw Error('元件参数无效');
        if (!(l.f>0 && l.d>=0 && l.ap>0 && l.th>=0 && l.th<80 && l.rf>=0 && l.rf<=100)) throw Error('元件参数超出范围');
      });
    }
    return s;
  }
  function route() {
    const p = new URLSearchParams(location.hash.slice(1));
    let k = p.get('tool');
    if (p.has('state')) {
      try {
        if (location.hash.length > 24000) throw Error('链接过长');
        const s = validate(JSON.parse(p.get('state'))); k = s.tool;
        Object.entries(initial[k]).forEach(([id,v]) => { $(id).value = v; });
        if (k === 'multi') renderLenses(s.lenses);
        Object.entries(s.values).forEach(([id,v]) => { $(id).value = v; });
        applyShow(); selectTab(k); run(k); saveState();
        tell('已载入分享参数。请核对输入、单位和模型适用范围。');
      } catch(e) { tell('未载入分享参数：' + e.message + '。请使用完整有效的链接。'); return; }
    }
    if (keys.includes(k)) { selectTab(k); saveState(); }
  }
  function download(blob, name) {
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  function button(text, handler) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'secondary'; b.textContent = text; b.addEventListener('click', handler); return b;
  }
  keys.forEach(k => {
    const row = document.createElement('div'); row.className = 'site-actions';
    row.append(button('分享当前参数', async () => {
      if (!confirm('分享链接包含当前工具的全部输入参数，任何获得链接的人都可以查看。请勿分享保密项目参数。继续？')) return;
      const s = snapshot(k), url = new URL(location.href); url.search = '';
      url.hash = new URLSearchParams({tool:k, state:JSON.stringify(s)}).toString();
      if (url.href.length > 24000) { tell('参数链接过长，无法分享。'); return; }
      try { await navigator.clipboard.writeText(url.href); tell('参数链接已复制。'); }
      catch { prompt('请复制参数链接：',url.href); }
    }), button('下载结果文本', () => {
      run(k); if (!lastResults[k]) { tell('请先修正输入错误。'); return; }
      download(new Blob(['光学工程工具箱 v0.1.0\n工程估算，非实测结果\n\n'+toTSV(lastResults[k])+'\n\n模型与风险提示\n'+[...$(k).querySelectorAll('.notice,.formula')].map(e=>e.textContent).join('\n')+'\n\n更多限制请参见本站使用说明。'],  {type:'text/plain;charset=utf-8'}), 'optics-'+k+'.txt');
    }));
    $(FORMS[k].form).append(row);
  });
  document.querySelectorAll('canvas').forEach(cv => {
    cv.after(button('下载此图 PNG', () => {
      const k = cv.closest('section.layout').id; run(k);
      if (!lastResults[k]) { tell('输入无效，无法导出图表。'); return; }
      const out = document.createElement('canvas'); out.width=cv.width; out.height=cv.height;
      const c=out.getContext('2d'); c.fillStyle='#fff'; c.fillRect(0,0,out.width,out.height); c.drawImage(cv,0,0);
      out.toBlob(blob => { if(blob) download(blob, 'optics-'+cv.id+'.png'); }, 'image/png');
    }));
  });
  document.querySelectorAll('.tab').forEach(b => {
    b.addEventListener('click', () => { location.hash = 'tool='+b.dataset.tab; });
    b.addEventListener('keydown', e => { if(['ArrowLeft','ArrowRight'].includes(e.key)) location.hash='tool='+active(); });
  });
  // Avoid leaving old shared parameters in the address after editing them.
  document.querySelectorAll('form').forEach(f => f.addEventListener('input', () => {
    if (location.hash.includes('state=')) history.replaceState(null,'','#tool='+active());
  }));
  document.querySelectorAll('form').forEach(f => f.addEventListener('click', e => {
    if (e.target.closest('[data-reset],#lensAdd,.ldel,#m_toWaist') && location.hash.includes('state=')) history.replaceState(null,'','#tool='+active());
  }));
  window.addEventListener('hashchange',route);
  window.addEventListener('resize',drawSpotChart);
  route();
  if (!status.textContent) tell('输入会尝试保存在当前浏览器；本网站不上传计算参数。工程估算请结合实测核对。');
})();
