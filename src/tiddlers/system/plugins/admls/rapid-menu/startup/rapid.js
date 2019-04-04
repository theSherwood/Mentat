/*\
created: 20190325160716778
type: application/javascript
title: $:/plugins/admls/rapid-menu/startup/rapid.js
tags: 
modified: 20190326084837428

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
    const rapidMenuTitle = '$:/plugins/admls/volant-rapid/ui/rapid-menu-popup';
    // Add rapid-menu to $:/StoryList
    $tw.wiki.addToStory(rapidMenuTitle, undefined, "$:/StoryList", riverPositions);
    $tw.wiki.addToHistory(rapidMenuTitle, undefined, "$:/HistoryList");

    $tw.wiki.setText('$:/state/rapid-menu/currentTiddler', 'text', undefined, title, undefined);

    window.addEventListener('click', closeRapidMenu, true);

    setTimeout(function () {
      let rapidMenu;
      rapidMenu = document.querySelector(`[data-tiddler-title*="${rapidMenuTitle}"]`);
      if (rapidMenu) {
        rapidMenu = rapidMenu.cloneNode(true);
        rapidMenu.className += ' rapid-menu-popup';
        rapidMenu.style.display = 'block';
        console.log(rapidMenu);
        rapidMenu.querySelectorAll('.tc-tiddler-title, .tc-reveal:not(.tc-tiddler-body)').forEach(element => {
          element.style.display = 'none';
        });
        // Style gets cleared in volant by the remove style thing
        rapidMenu.style.cssText += `top: ${e.clientY}px;`;
        rapidMenu.style.cssText += `left: ${e.clientX}px;`;
        document.documentElement.appendChild(rapidMenu);
      }
    }, 10);

    // console.log(e.clientX, e.clientY);


  }

  function closeRapidMenu(e) {
    const rapidMenuTitle = "$:/plugins/admls/volant-rapid/ui/rapid-menu-popup";
    let elmnt = e.target;
    // Get the tiddler that the event happened in
    while (!(elmnt.matches('.tc-tiddler-frame'))) {
      // Stop if you get to the root element
      if (elmnt.tagName === "HTML") {
        break;
      }
      elmnt = elmnt.parentElement;
    }
    if (!(elmnt.matches(`[data-tiddler-title*="${rapidMenuTitle}"]`))) {
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
      const rapidMenus = document.querySelectorAll(".rapid-menu-popup");
      if (rapidMenus.length > 0) {
        rapidMenus.forEach(popup => {
          document.documentElement.removeChild(popup);
        });
      }
      window.removeEventListener('click', closeRapidMenu, true);
    }

  }

  if ($tw.browser) {
    window.addEventListener('dblclick', openRapidMenu);
  }

  
})();