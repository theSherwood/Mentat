/*\
created: 20190322091422151
type: application/javascript
title: $:/plugins/admls/volant-rapid/globals/rapid.js
tags: 
modified: 20190322160843162
module-type: startup

Rapidly reposition volant tiddlers.

\*/
(function () {

  /*jslint node: true, browser: true */
  /*global $tw: false */
  "use strict";

  function openRapidMenu(e) {
    let elmnt = e.target;
    // Get the tiddler that the event happened in
    while (!(elmnt.matches('.tc-tiddler-frame'))) {
      // Stop if you get to the root element
      if (elmnt.tagName === "HTML") {
        return;
      }
      elmnt = elmnt.parentElement;
    }
    e.preventDefault();
    e.stopPropagation();
    const tiddler = elmnt;
    const title = tiddler ? tiddler.dataset.tiddlerTitle : undefined;
    if (!title) {
      return;
    }
    const riverPositions = {
      openLinkFromInsideRiver: $tw.wiki.getTiddler("$:/config/Navigation/openLinkFromInsideRiver").fields.text || "top",
      openLinkFromOutsideRiver: $tw.wiki.getTiddler("$:/config/Navigation/openLinkFromOutsideRiver").fields.text || "top"
    }
    // Add rapid-menu to $:/StoryList
    $tw.wiki.addToStory('$:/plugins/admls/volant-rapid/ui/rapid-menu', undefined, "$:/StoryList", riverPositions);
    $tw.wiki.addToHistory('$:/plugins/admls/volant-rapid/ui/rapid-menu', undefined, "$:/HistoryList");

    $tw.wiki.setText('$:/state/rapid-menu/currentTiddler', 'text', undefined, title, undefined);

    window.addEventListener('click', closeRapidMenu);

    setTimeout(function () {
      let rapidMenu;
      let i = 0;
      while (!rapidMenu && i < 10000) {
        rapidMenu = document.querySelector('[data-tiddler-title*="$:/plugins/admls/volant-rapid/ui/rapid-menu"]');
        console.log(rapidMenu);
        i++;
      }
    }, 0);

    console.log(e.clientX, e.clientY);


  }

  function closeRapidMenu(e) {
    const rapidMenuTitle = "$:/plugins/admls/volant-rapid/ui/rapid-menu";
    let elmnt = e.target;
    // Get the tiddler that the event happened in
    while (!(elmnt.matches('.tc-tiddler-frame'))) {
      // Stop if you get to the root element
      if (elmnt.tagName === "HTML") {
        break;
      }
      elmnt = elmnt.parentElement;
    }
    if (!(elmnt.matches('[data-tiddler-title*="$:/plugins/admls/volant-rapid/ui/rapid-menu"]'))) {
      // remove rapid menu from story list
      const storyTiddler = $tw.wiki.getTiddler('$:/StoryList');
      let storyList = storyTiddler.fields.list.slice();
      let p = storyList.indexOf(rapidMenuTitle);
      while (p !== -1) {
        storyList.splice(p, 1);
        p = storyList.indexOf(rapidMenuTitle);
      }
      $tw.wiki.addTiddler(new $tw.Tiddler(
        { title: '$:/StoryList' },
        storyTiddler,
        { list: storyList }
      ));
    }
  }

  if ($tw.browser) {
    window.addEventListener('dblclick', openRapidMenu);
  }

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