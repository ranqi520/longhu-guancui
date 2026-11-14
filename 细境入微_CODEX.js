(() => {
 'use strict';
 const rooms=[
  {
    "key": "living",
    "zh": "客厅",
    "en": "LIVING ROOM",
    "slide": "details09",
    "title": "木与织物，回应日常。",
    "titleEn": "Timber and textiles, made for everyday life.",
    "overview": {
      "src": "assets/细境入微_CODEX/09_living_overview_CODEX.webp",
      "full": "assets/细境入微_CODEX/09_living_overview_full_CODEX.webp",
      "width": 2400,
      "height": 1350,
      "zh": "空间全景",
      "en": "THE COMPLETE SPACE"
    },
    "details": [
      {
        "zh": "书香一隅",
        "en": "A corner for reading",
        "src": "assets/细境入微_CODEX/09_living_01_CODEX.webp",
        "thumb": "assets/细境入微_CODEX/09_living_01_thumb_CODEX.webp",
        "full": "assets/细境入微_CODEX/09_living_01_full_CODEX.webp"
      },
      {
        "zh": "木石对话",
        "en": "Timber and stone",
        "src": "assets/细境入微_CODEX/09_living_02_CODEX.webp",
        "thumb": "assets/细境入微_CODEX/09_living_02_thumb_CODEX.webp",
        "full": "assets/细境入微_CODEX/09_living_02_full_CODEX.webp"
      },
      {
        "zh": "围坐日常",
        "en": "A place to gather",
        "src": "assets/细境入微_CODEX/09_living_03_CODEX.webp",
        "thumb": "assets/细境入微_CODEX/09_living_03_thumb_CODEX.webp",
        "full": "assets/细境入微_CODEX/09_living_03_full_CODEX.webp"
      },
      {
        "zh": "藤编与条纹",
        "en": "Woven curves and stripes",
        "src": "assets/细境入微_CODEX/09_living_04_CODEX.webp",
        "thumb": "assets/细境入微_CODEX/09_living_04_thumb_CODEX.webp",
        "full": "assets/细境入微_CODEX/09_living_04_full_CODEX.webp"
      },
      {
        "zh": "织物层次",
        "en": "Layers of texture",
        "src": "assets/细境入微_CODEX/09_living_05_CODEX.webp",
        "thumb": "assets/细境入微_CODEX/09_living_05_thumb_CODEX.webp",
        "full": "assets/细境入微_CODEX/09_living_05_full_CODEX.webp"
      },
      {
        "zh": "阅读的陪伴",
        "en": "A reading companion",
        "src": "assets/细境入微_CODEX/09_living_06_CODEX.webp",
        "thumb": "assets/细境入微_CODEX/09_living_06_thumb_CODEX.webp",
        "full": "assets/细境入微_CODEX/09_living_06_full_CODEX.webp"
      }
    ],
    "note": "从书柜到围坐，以木、藤与织物串联会客和阅读。",
    "noteEn": "Timber, woven forms and textiles connect gathering with quiet reading."
  },
  {
    "key": "dining",
    "zh": "餐厨区",
    "en": "DINING & KITCHEN",
    "slide": "details09-dining",
    "title": "烟火之间，细节有温。",
    "titleEn": "Warmth in the details of everyday rituals.",
    "overview": {
      "src": "assets/细境入微_CODEX/09_dining_overview_CODEX.webp",
      "full": "assets/细境入微_CODEX/09_dining_overview_full_CODEX.webp",
      "width": 2400,
      "height": 1340,
      "zh": "空间全景",
      "en": "THE COMPLETE SPACE"
    },
    "details": [
      {
        "zh": "木石交界",
        "en": "Where timber meets stone",
        "src": "assets/细境入微_CODEX/09_dining_01_CODEX.webp",
        "thumb": "assets/细境入微_CODEX/09_dining_01_thumb_CODEX.webp",
        "full": "assets/细境入微_CODEX/09_dining_01_full_CODEX.webp"
      },
      {
        "zh": "餐桌上的红",
        "en": "A touch of red",
        "src": "assets/细境入微_CODEX/09_dining_02_CODEX.webp",
        "thumb": "assets/细境入微_CODEX/09_dining_02_thumb_CODEX.webp",
        "full": "assets/细境入微_CODEX/09_dining_02_full_CODEX.webp"
      },
      {
        "zh": "烟火日常",
        "en": "The everyday kitchen",
        "src": "assets/细境入微_CODEX/09_dining_03_CODEX.webp",
        "thumb": "assets/细境入微_CODEX/09_dining_03_thumb_CODEX.webp",
        "full": "assets/细境入微_CODEX/09_dining_03_full_CODEX.webp"
      }
    ],
    "note": "石材与木色构成背景，红色桌旗与陶器点出日常温度。",
    "noteEn": "Stone and timber form the backdrop, with a red runner and ceramics adding warmth."
  },
  {
    "key": "master",
    "zh": "主卧",
    "en": "PRIMARY BEDROOM",
    "slide": "details09-master",
    "title": "安静之中，感受肌理。",
    "titleEn": "A quiet retreat, rich in texture.",
    "overview": {
      "src": "assets/细境入微_CODEX/09_master_overview_CODEX.webp",
      "full": "assets/细境入微_CODEX/09_master_overview_full_CODEX.webp",
      "width": 2400,
      "height": 1340,
      "zh": "空间全景",
      "en": "THE COMPLETE SPACE"
    },
    "details": [
      {
        "zh": "梳妆一隅",
        "en": "The dressing corner",
        "src": "assets/细境入微_CODEX/09_master_01_CODEX.webp",
        "thumb": "assets/细境入微_CODEX/09_master_01_thumb_CODEX.webp",
        "full": "assets/细境入微_CODEX/09_master_01_full_CODEX.webp"
      },
      {
        "zh": "床品肌理",
        "en": "Layers of linen",
        "src": "assets/细境入微_CODEX/09_master_02_CODEX.webp",
        "thumb": "assets/细境入微_CODEX/09_master_02_thumb_CODEX.webp",
        "full": "assets/细境入微_CODEX/09_master_02_full_CODEX.webp"
      },
      {
        "zh": "床头构景",
        "en": "The bedside composition",
        "src": "assets/细境入微_CODEX/09_master_03_CODEX.webp",
        "thumb": "assets/细境入微_CODEX/09_master_03_thumb_CODEX.webp",
        "full": "assets/细境入微_CODEX/09_master_03_full_CODEX.webp"
      },
      {
        "zh": "窗畔片刻",
        "en": "A pause by the window",
        "src": "assets/细境入微_CODEX/09_master_04_CODEX.webp",
        "thumb": "assets/细境入微_CODEX/09_master_04_thumb_CODEX.webp",
        "full": "assets/细境入微_CODEX/09_master_04_full_CODEX.webp"
      }
    ],
    "note": "从床头到窗畔，在织物、木作与细小陈设间安放宁静。",
    "noteEn": "A quiet composition of textiles, joinery and small objects, from bedside to window."
  },
  {
    "key": "children",
    "zh": "儿童房",
    "en": "CHILDREN’S ROOM",
    "slide": "details09-children",
    "title": "柔软童趣，慢慢生长。",
    "titleEn": "Soft details, with room to grow.",
    "overview": {
      "src": "assets/细境入微_CODEX/09_children_overview_CODEX.webp",
      "full": "assets/细境入微_CODEX/09_children_overview_full_CODEX.webp",
      "width": 2400,
      "height": 1340,
      "zh": "空间全景",
      "en": "THE COMPLETE SPACE"
    },
    "details": [
      {
        "zh": "床幔与微光",
        "en": "Canopy and lamplight",
        "src": "assets/细境入微_CODEX/09_children_01_CODEX.webp",
        "thumb": "assets/细境入微_CODEX/09_children_01_thumb_CODEX.webp",
        "full": "assets/细境入微_CODEX/09_children_01_full_CODEX.webp"
      },
      {
        "zh": "伴读时光",
        "en": "A place to learn",
        "src": "assets/细境入微_CODEX/09_children_02_CODEX.webp",
        "thumb": "assets/细境入微_CODEX/09_children_02_thumb_CODEX.webp",
        "full": "assets/细境入微_CODEX/09_children_02_full_CODEX.webp"
      },
      {
        "zh": "花朵与绒感",
        "en": "Softness underfoot",
        "src": "assets/细境入微_CODEX/09_children_03_CODEX.webp",
        "thumb": "assets/细境入微_CODEX/09_children_03_thumb_CODEX.webp",
        "full": "assets/细境入微_CODEX/09_children_03_full_CODEX.webp"
      }
    ],
    "note": "木色家具与柔软织物，容纳阅读、游戏与成长。",
    "noteEn": "Timber furniture and soft textiles make room for reading, play and growing up."
  },
  {
    "key": "balcony",
    "zh": "阳台",
    "en": "BALCONY",
    "slide": "details09-balcony",
    "title": "向景而坐，日常生趣。",
    "titleEn": "A place to pause, close to nature.",
    "overview": {
      "src": "assets/细境入微_CODEX/09_balcony_overview_CODEX.webp",
      "full": "assets/细境入微_CODEX/09_balcony_overview_full_CODEX.webp",
      "width": 2400,
      "height": 1340,
      "zh": "空间全景",
      "en": "THE COMPLETE SPACE"
    },
    "details": [
      {
        "zh": "藤椅小憩",
        "en": "A woven retreat",
        "src": "assets/细境入微_CODEX/09_balcony_01_CODEX.webp",
        "thumb": "assets/细境入微_CODEX/09_balcony_01_thumb_CODEX.webp",
        "full": "assets/细境入微_CODEX/09_balcony_01_full_CODEX.webp"
      },
      {
        "zh": "花台层次",
        "en": "Layers of greenery",
        "src": "assets/细境入微_CODEX/09_balcony_02_CODEX.webp",
        "thumb": "assets/细境入微_CODEX/09_balcony_02_thumb_CODEX.webp",
        "full": "assets/细境入微_CODEX/09_balcony_02_full_CODEX.webp"
      },
      {
        "zh": "向景而坐",
        "en": "Seating by the view",
        "src": "assets/细境入微_CODEX/09_balcony_03_CODEX.webp",
        "thumb": "assets/细境入微_CODEX/09_balcony_03_thumb_CODEX.webp",
        "full": "assets/细境入微_CODEX/09_balcony_03_full_CODEX.webp"
      },
      {
        "zh": "家务亦从容",
        "en": "Everyday rituals",
        "src": "assets/细境入微_CODEX/09_balcony_04_CODEX.webp",
        "thumb": "assets/细境入微_CODEX/09_balcony_04_thumb_CODEX.webp",
        "full": "assets/细境入微_CODEX/09_balcony_04_full_CODEX.webp"
      }
    ],
    "note": "藤椅、花台与生活柜体，让自然与日常在此相遇。",
    "noteEn": "Woven seating, planted borders and everyday joinery bring nature into daily life."
  }
];
 const sections=[...document.querySelectorAll('[data-detail-room]')];
 if(!sections.length)return;
 const pointerHover=matchMedia('(hover: hover) and (pointer: fine)');
 const selected=new Map(rooms.map(room=>[room.key,0]));
 const gallery=[];const offsets=new Map();
 for(const room of rooms){
  offsets.set(room.key,gallery.length);
  for(const board of [room.overview,...room.details])gallery.push({room,board:{...board,alt:room.zh+' · '+board.zh+' / '+room.en+' · '+board.en}});
 }
 function hydrateCard(card){const image=card.querySelector('img');if(!image.getAttribute('src'))image.src=image.dataset.detailSrc;}
 function render(section,index,load=true){
  const room=rooms.find(room=>room.key===section.dataset.detailRoom);
  const count=room.details.length;index=(index+count)%count;selected.set(room.key,index);
  const detail=room.details[index];
  section.querySelectorAll('[data-detail-card]').forEach(card=>{
   const n=Number(card.dataset.detailCard),rank=(n-index+count)%count;
   card.hidden=rank>2;card.classList.toggle('is-front',rank===0);card.classList.toggle('is-second',rank===1);card.classList.toggle('is-third',rank===2);card.tabIndex=rank===0?0:-1;
   const d=room.details[n];card.setAttribute('aria-label',room.zh+' · '+d.zh+(rank===0?'，点击查看高清 / '+d.en+'; enlarge detail':'，点击翻至前面 / '+d.en+'; bring detail forward'));
   if(load&&rank<3&&(document.documentElement.dataset.mobileReport!=="true"||document.body.dataset.activeSlide===section.dataset.slideId))hydrateCard(card);
  });
  section.querySelectorAll('[data-detail-select]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.detailSelect)===index)));
  section.querySelector('[data-detail-title]').textContent=detail.zh;
  section.querySelector('[data-detail-title-en]').textContent=detail.en;
  section.querySelector('[data-detail-count]').textContent=String(index+1).padStart(2,'0')+' / '+String(count).padStart(2,'0');
 }
 function open(section,overview,trigger){
  const room=rooms.find(room=>room.key===section.dataset.detailRoom);
  window.MATERIALS_REPORT.openBoards(gallery,offsets.get(room.key)+(overview?0:1+selected.get(room.key)),trigger);
 }
 for(const section of sections){
  const room=rooms.find(room=>room.key===section.dataset.detailRoom);
  render(section,0,false);
  section.querySelectorAll('[data-detail-target]').forEach(button=>button.addEventListener('click',()=>window.VERTICAL_REPORT.go(button.dataset.detailTarget,{instant:matchMedia('(prefers-reduced-motion: reduce)').matches})));
  section.querySelector('[data-detail-overview]').addEventListener('click',event=>open(section,true,event.currentTarget));
  section.querySelectorAll('[data-detail-select]').forEach(button=>{
   const select=()=>render(section,Number(button.dataset.detailSelect));
   button.addEventListener('click',select);
   button.addEventListener('pointerenter',event=>{if(pointerHover.matches&&event.pointerType!=='touch')select()});
  });
  let swipe=null,suppressUntil=0;const stack=section.querySelector('.detail-stack');
  const hint=document.createElement('p');hint.className='detail-swipe-hint';hint.innerHTML='← 左右滑动 · 查看空间细节 →<small lang="en">SWIPE TO EXPLORE THE DETAILS</small>';stack.after(hint);
  stack.addEventListener('pointerdown',event=>{if(event.pointerType==='touch'&&event.isPrimary)swipe={id:event.pointerId,x:event.clientX,y:event.clientY,moved:0,horizontal:false};});
  stack.addEventListener('pointermove',event=>{
   if(!swipe||swipe.id!==event.pointerId)return;
   const dx=event.clientX-swipe.x,dy=event.clientY-swipe.y;swipe.moved=Math.max(swipe.moved,Math.hypot(dx,dy));
   if(!swipe.horizontal&&Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)*1.3){swipe.horizontal=true;stack.setPointerCapture(event.pointerId);stack.classList.add('is-swiping');}
  });
  stack.addEventListener('pointerup',event=>{
   if(!swipe||swipe.id!==event.pointerId)return;const p=swipe;swipe=null;stack.classList.remove('is-swiping');
   const dx=event.clientX-p.x,dy=event.clientY-p.y;
   if(Math.abs(dx)>32&&Math.abs(dx)>Math.abs(dy)*1.3){suppressUntil=performance.now()+600;render(section,selected.get(room.key)+(dx<0?1:-1));}
   else if(p.moved>12)suppressUntil=performance.now()+600;
  });
  for(const type of ['pointercancel','lostpointercapture'])stack.addEventListener(type,event=>{if(type==='lostpointercapture'&&event.target!==stack)return;if(swipe?.moved>12)suppressUntil=performance.now()+600;swipe=null;stack.classList.remove('is-swiping');});
  section.querySelectorAll('[data-detail-card]').forEach(card=>card.addEventListener('click',event=>{
   if(performance.now()<suppressUntil){event.preventDefault();return;}
   const n=Number(card.dataset.detailCard);if(n===selected.get(room.key))open(section,false,event.currentTarget);else render(section,n);
  }));
  section.querySelector('[data-detail-prev]').addEventListener('click',()=>render(section,selected.get(room.key)-1));
  section.querySelector('[data-detail-next]').addEventListener('click',()=>render(section,selected.get(room.key)+1));
  section.querySelector('.detail-closeups').addEventListener('keydown',event=>{
   if(event.altKey||event.ctrlKey||event.metaKey||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
   event.preventDefault();event.stopPropagation();
   const n=event.key==='Home'?0:event.key==='End'?room.details.length-1:selected.get(room.key)+(event.key==='ArrowRight'?1:-1);
   render(section,n);section.querySelector('[data-detail-select="'+selected.get(room.key)+'"]').focus({preventScroll:true});
  });
 }
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){const room=rooms.find(room=>room.key===entry.target.dataset.detailRoom);render(entry.target,selected.get(room.key));}},{rootMargin:'250px 0px'});
 sections.forEach(section=>observer.observe(section));
 window.addEventListener('report:slidechange',event=>{const section=sections.find(section=>section.dataset.slideId===event.detail.key);if(section)render(section,selected.get(section.dataset.detailRoom));});
 window.DETAILS_REPORT={inspect:()=>({rooms:rooms.map(room=>({key:room.key,slide:room.slide,count:room.details.length,selected:selected.get(room.key),overview:room.overview.src})),details:rooms.reduce((sum,room)=>sum+room.details.length,0),gallery:gallery.length})};
})();
