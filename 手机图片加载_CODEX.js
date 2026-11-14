(() => {
 'use strict';
 const mobile=document.documentElement.dataset.mobileReport==='true';
 const images=[...document.querySelectorAll('img[data-report-image-src]')];
 let observer;
 function load(image){
  if(!image.getAttribute('src'))image.src=image.dataset.reportImageSrc;
  observer?.unobserve(image);
 }
 if(!mobile||!('IntersectionObserver' in window))images.forEach(load);
 else{
  // Native lazy loading may fetch several chapters ahead on a narrow phone.
  // Keep those full-size boards out of the network queue while a film starts.
  observer=new IntersectionObserver(entries=>{
   for(const entry of entries)if(entry.isIntersecting)load(entry.target);
  },{rootMargin:'80px 0px'});
  images.forEach(image=>observer.observe(image));
  window.addEventListener('report:slidechange',event=>{
   const slide=document.querySelector('[data-slide-id="'+event.detail.key+'"]');
   slide?.querySelectorAll('img[data-report-image-src]').forEach(load);
  });
 }
 window.REPORT_IMAGES={inspect:()=>({mobile,total:images.length,loaded:images.filter(image=>!!image.getAttribute('src')).length})};
})();
