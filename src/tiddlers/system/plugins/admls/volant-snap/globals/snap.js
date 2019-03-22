/*\
created: 20190322091422151
type: application/javascript
title: $:/plugins/admls/volant-snap/globals/snap.js
tags: 
modified: 20190322091756388
module-type: global

\*/
(function () {

  /*jslint node: true, browser: true */
  /*global $tw: false */
  "use strict";

  $tw.hooks.addHook("volant-snap-to-grid", tiddler => {
    const positionIsFixed = (tiddler.style.position === "fixed");
    const { top, left, bottom, right } = tiddler.getBoundingClientRect();
    const viewportHeight = document.documentElement.clientHeight;
    const viewportWidth = document.documentElement.clientWidth;

    function expandHeight() {
      if (top > 0 && bottom < viewportHeight) {
        tiddler.style.cssText += `top: 0%;`;
        tiddler.style.cssText += `height: 100%;`;
      }
    }
    function expandWidth() {
      if (left > 0 && right < viewportWidth) {
        tiddler.style.cssText += `left: 0%;`;
        tiddler.style.cssText += `width: 100%;`;
      }
    }

    if (positionIsFixed) {
      if (top < 0) {
        tiddler.style.cssText += `top: 0%;`;
        tiddler.style.cssText += `height: 50%;`;
        expandWidth();
      }
      if (left < 0) {
        tiddler.style.cssText += `left: 0%;`;
        tiddler.style.cssText += `width: 50%;`;
        expandHeight();
      }
      if (bottom > viewportHeight) {
        tiddler.style.cssText += `top: 50%;`;
        tiddler.style.cssText += `height: 50%;`;
        expandWidth();
      }
      if (right > viewportWidth) {
        tiddler.style.cssText += `left: 50%;`;
        tiddler.style.cssText += `width: 50%;`;
        expandHeight();
      }
    }
    return tiddler;
  });

})();