/*\
created: 20190322091422151
type: application/javascript
title: $:/plugins/admls/volant-rapid/globals/rapid.js
tags: 
modified: 20190322160843162
module-type: global

Adds hook that snaps volant tiddlers to the edges of the viewport if an edge the tiddler overlaps the viewport edge. Allows for rapid repositioning of tiddlers.

\*/
(function() {
  /*jslint node: true, browser: true */
  /*global $tw: false */
  "use strict";

  $tw.hooks.addHook("volant-snap-to-grid", tiddler => {
    const positionIsFixed = tiddler.style.position === "fixed";
    const { top, left, bottom, right } = tiddler.getBoundingClientRect();
    const viewportHeight = document.documentElement.clientHeight;
    const viewportWidth = document.documentElement.clientWidth;
    /*
    Buffer: how far the volant tiddler must overlap the viewport to snap
    to the edge of the screen
    */
    const bufferTiddler = $tw.wiki.getTiddler(
      "$:/plugins/admls/volant-rapid/config/buffer"
    );
    const buffer =
      bufferTiddler && Number(bufferTiddler.fields.text)
        ? Number(bufferTiddler.fields.text)
        : 0;

    function expandHeight() {
      if (top - buffer > 0 && bottom + buffer < viewportHeight) {
        tiddler.style.cssText += `top: 0%;`;
        tiddler.style.cssText += `height: 100%;`;
      }
    }
    function expandWidth() {
      if (left - buffer > 0 && right + buffer < viewportWidth) {
        tiddler.style.cssText += `left: 0%;`;
        tiddler.style.cssText += `width: 100%;`;
      }
    }

    if (positionIsFixed) {
      if (top + buffer < 0) {
        tiddler.style.cssText += `top: 0%;`;
        tiddler.style.cssText += `height: 50%;`;
        expandWidth();
      }
      if (left + buffer < 0) {
        tiddler.style.cssText += `left: 0%;`;
        tiddler.style.cssText += `width: 50%;`;
        expandHeight();
      }
      if (bottom - buffer > viewportHeight) {
        tiddler.style.cssText += `top: 50%;`;
        tiddler.style.cssText += `height: 50%;`;
        expandWidth();
      }
      if (right - buffer > viewportWidth) {
        tiddler.style.cssText += `left: 50%;`;
        tiddler.style.cssText += `width: 50%;`;
        expandHeight();
      }
    }
    return tiddler;
  });
})();
