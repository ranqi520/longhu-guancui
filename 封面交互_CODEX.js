(() => {
 'use strict';
 const $ = selector => document.querySelector(selector), $$ = selector => [...document.querySelectorAll(selector)];
 const project = window.REPORT_PROJECT, images = project.images;
 const gallery = $('#gallery-dialog'), info = $('#info-dialog');
 const rooms = {'全部':'ALL SPACES','客厅':'LIVING','主卧':'BEDROOM','餐厨':'DINING & KITCHEN','儿童房':'CHILDREN’S','阳台':'BALCONY'};
 let currentPage = 'cover', pendingClosing = false, toastTimer;
 function bilingual(node, zh, en, tag = 'small') {
  node.replaceChildren(document.createTextNode(zh)); const label = document.createElement(tag); label.lang = 'en'; label.textContent = en; node.append(label);
 }
 $$('[data-project]').forEach(node => { node.textContent = project[node.dataset.project]; });
 $$('[data-archive]').forEach(node => { const key = node.dataset.archive; bilingual(node, project[key], project[key + 'En']); });
 function showPage(name, options = {}) {
  if (window.VERTICAL_REPORT) { window.VERTICAL_REPORT.go(name, {instant: options.history === false, focus: options.focus}); return; }
  if (!['cover','closing'].includes(name)) name = 'cover';
  const changed = name !== currentPage; currentPage = name;
  $$('.report-page').forEach(page => { const active = page.id === name + '-page'; page.hidden = !active; page.classList.toggle('is-active', active); });
  document.body.classList.toggle('is-closing', name === 'closing');
  $$('.nav-item[data-page]').forEach(button => { const active = button.dataset.page === name; button.classList.toggle('is-active', active); if (active) button.setAttribute('aria-current','page'); else button.removeAttribute('aria-current'); });
  $('#page-number').textContent = name === 'cover' ? '01' : '03';
  $('meta[name="theme-color"]').content = name === 'cover' ? '#f3f0e7' : '#263d34';
  if (options.history !== false && location.hash !== '#' + name) history.replaceState(null,'','#' + name);
  if (changed || options.focus) { window.scrollTo({top:0,behavior:'instant'}); if (options.focus) $('#main-content').focus({preventScroll:true}); }
 }
 $$('[data-page]').forEach(button => button.addEventListener('click', event => { event.preventDefault(); showPage(button.dataset.page, {focus:true}); }));
 if (!window.VERTICAL_REPORT) {
  window.addEventListener('hashchange', () => showPage(location.hash.slice(1), {history:false,focus:true}));
  showPage(location.hash.slice(1), {history:false});
 }
 function openDialog(dialog) { if (!dialog.open) dialog.showModal(); document.body.classList.add('has-dialog'); }
 [gallery,info].forEach(dialog => {
  dialog.addEventListener('close', () => {
   if (![gallery,info].some(item => item.open)) document.body.classList.remove('has-dialog');
   if (dialog === gallery && pendingClosing) { pendingClosing = false; showPage('closing',{focus:true}); }
  });
  dialog.addEventListener('click', event => { if (event.target !== dialog) return; const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); });
 });
 $$('[data-close]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.close).close()));
 $('#info-button').addEventListener('click', () => openDialog(info));
 function notify(zh,en) { const node = $('#status-message'); bilingual(node,zh,en); node.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => {node.hidden = true;},4000); }
 const fullscreen = $('#fullscreen-button');
 fullscreen.addEventListener('click', async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); else notify('当前浏览器暂不支持全屏。','Fullscreen is unavailable in this browser.'); } catch { notify('暂时无法进入全屏，可使用浏览器全屏功能。','Please use your browser’s fullscreen control.'); } });
 document.addEventListener('fullscreenchange', () => { const label = document.fullscreenElement ? '退出全屏 / Exit fullscreen' : '进入全屏 / Enter fullscreen'; fullscreen.title = label; fullscreen.setAttribute('aria-label',label); });
 let activeFilter = '全部', currentIndex = 0, filtered = images.map((_,i) => i), requestId = 0;
 const imageNode = $('#gallery-image'), loading = $('#gallery-loading'), filters = $('#room-filters'), thumbnails = $('#gallery-thumbnails');
 Object.entries(rooms).forEach(([zh,en]) => {
  if (zh !== '全部' && !images.some(image => image.room === zh)) return;
  const button = document.createElement('button'); button.className = 'room-filter'; button.dataset.room = zh; bilingual(button,zh,en);
  button.addEventListener('click', () => { activeFilter = zh; filtered = images.flatMap((image,i) => zh === '全部' || image.room === zh ? [i] : []); renderFilters(); renderThumbnails(); showImage(filtered.includes(currentIndex) ? currentIndex : filtered[0]); }); filters.append(button);
 });
 function renderFilters() { $$('.room-filter').forEach(button => { const active = button.dataset.room === activeFilter; button.classList.toggle('is-active',active); button.setAttribute('aria-pressed',String(active)); }); }
 function renderThumbnails() {
  thumbnails.replaceChildren(); filtered.forEach(index => {
   const image = images[index], button = document.createElement('button'); button.className = 'thumbnail'; button.dataset.index = String(index); button.setAttribute('aria-label','查看' + image.title + ' / View ' + image.titleEn);
   const thumb = document.createElement('img'); thumb.src = image.src; thumb.alt = ''; thumb.loading = 'lazy'; thumb.decoding = 'async';
   const label = document.createElement('span'); bilingual(label,image.title,image.titleEn); button.append(thumb,label); button.addEventListener('click', () => showImage(index)); thumbnails.append(button);
  });
 }
 function showImage(index) {
  currentIndex = index; const request = ++requestId, image = images[index];
  bilingual(loading,'正在载入影像…','Loading image…','span'); loading.hidden = false;
  imageNode.onload = () => { if (request === requestId) loading.hidden = true; };
  imageNode.onerror = () => { if (request === requestId) bilingual(loading,'图片暂时无法载入，请选择其他影像。','Image unavailable. Please choose another view.','span'); };
  imageNode.alt = image.title + '效果图 / ' + image.titleEn + ' rendering'; imageNode.src = image.src;
  if (imageNode.complete && imageNode.naturalWidth > 0) loading.hidden = true;
  bilingual($('#gallery-caption'),image.title,image.titleEn);
  const position = filtered.indexOf(index); $('#gallery-count').textContent = String(position + 1).padStart(2,'0') + ' / ' + String(filtered.length).padStart(2,'0');
  $('#gallery-previous').disabled = $('#gallery-next').disabled = filtered.length < 2;
  $$('.thumbnail').forEach(button => { const active = Number(button.dataset.index) === index; button.classList.toggle('is-active',active); button.setAttribute('aria-pressed',String(active)); if (active) button.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'}); });
  const next = filtered[(position + 1) % filtered.length]; if (next !== index) { const preload = new Image(); preload.src = images[next].src; }
 }
 function openGallery() { activeFilter = '全部'; filtered = images.map((_,i) => i); renderFilters(); renderThumbnails(); openDialog(gallery); showImage(currentIndex); }
 function moveGallery(direction) { showImage(filtered[(filtered.indexOf(currentIndex) + direction + filtered.length) % filtered.length]); }
 $$('[data-gallery]').forEach(button => button.addEventListener('click',openGallery));
 $('#gallery-previous').addEventListener('click', () => moveGallery(-1)); $('#gallery-next').addEventListener('click', () => moveGallery(1));
 gallery.addEventListener('keydown', event => { if (['ArrowRight','ArrowLeft'].includes(event.key)) { event.preventDefault(); moveGallery(event.key === 'ArrowRight' ? 1 : -1); } });
 $('#gallery-to-closing').addEventListener('click', () => { pendingClosing = true; gallery.close(); });
 let pointerStart = null; const stage = $('#gallery-stage');
 stage.addEventListener('pointerdown', event => { if (event.pointerType === 'mouse' || event.target.closest('button') || !event.isPrimary) return; pointerStart = {x:event.clientX,y:event.clientY,id:event.pointerId}; });
 stage.addEventListener('pointerup', event => { if (!pointerStart || pointerStart.id !== event.pointerId) return; const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y; pointerStart = null; if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) moveGallery(dx < 0 ? 1 : -1); });
 stage.addEventListener('pointercancel', () => {pointerStart = null;});
 const art = $('#art-stage');
 if (matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
  art.addEventListener('pointermove', event => {const r = art.getBoundingClientRect(); art.style.setProperty('--tilt-y',((event.clientX-r.left)/r.width*5-2.5).toFixed(2)+'deg'); art.style.setProperty('--tilt-x',(2-(event.clientY-r.top)/r.height*4).toFixed(2)+'deg');});
  art.addEventListener('pointerleave', () => {art.style.setProperty('--tilt-y','0deg');art.style.setProperty('--tilt-x','0deg');});
 }
})();
