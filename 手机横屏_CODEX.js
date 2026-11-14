(() => {
 'use strict';
 // Keep bookmarked mobile-shell addresses working without a nested/rotated page.
 const url=new URL('index.html',location.href);
 url.search=location.search;url.searchParams.delete('mobile-frame');url.hash='#cover';
 location.replace(url.href);
})();
