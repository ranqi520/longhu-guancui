(() => {
 'use strict';
 // Use the browser's native viewport and touch scrolling; never rotate a frame.
 const touchDevice=navigator.maxTouchPoints>0&&(matchMedia('(pointer:coarse)').matches||/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
 if(touchDevice)document.documentElement.dataset.mobileReport='true';
})();
