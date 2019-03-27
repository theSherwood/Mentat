/*\
created: 20190301234816184
title: $:/plugins/admls/mentat/globals/mentat.js
type: application/javascript
tags: 
modified: 20190315192300663
module-type: global

Adds methods and hooks for navigation in mentat storyview

\*/
(function() {
  /*jslint node: true, browser: true */
  /*global $tw: false */
  "use strict";

  const Mentat = {
    allowedTags: ["$:/Window"],

    getTopWindow: function(windowTitles, storyList) {
      // Filter zStack by windowTitles
      const zStackTitles = $tw.Volant.zStack.map(
        tiddler => tiddler.dataset.tiddlerTitle
      );
      const windowsOnStack = zStackTitles.filter(windowTitle =>
        windowTitles.includes(windowTitle)
      );
      // Filter story list by windowTitles
      const windowsInStory = storyList.filter(windowTitle =>
        windowTitles.includes(windowTitle)
      );
      // Filter windowsOnStack by windowsInStory and get the one at the top of the stack
      const preferredWindow = windowsOnStack
        .filter(windowTitle => windowsInStory.includes(windowTitle))
        .slice(-1)[0];
      const topWindow =
        preferredWindow ||
        windowsInStory.slice(-1)[0] ||
        windowsOnStack.slice(-1)[0] ||
        windowTitles.slice(-1)[0];
      return topWindow;
    },

    createWindow: function() {
      // Add a window to the tiddler store
      let windowTitle = $tw.wiki.generateNewTitle("$:/Window");
      const windowTiddler = new $tw.Tiddler({
        title: windowTitle,
        tags: "$:/Window $:/config/Volant",
        view:
          $tw.wiki.getTiddler("$:/plugins/admls/mentat/config/values").fields[
            "default-window-storyview"
          ] || "classic"
      });
      $tw.wiki.addTiddler(windowTiddler);
      return windowTitle;
    },

    addToWindow: function(event, windowTitle) {
      const riverPositions = $tw.Mentat.getRiverPositions();
      // Add the toTitleTiddler to the window
      $tw.wiki.addToStory(
        event.navigateTo,
        event.navigateFromTitle,
        windowTitle,
        riverPositions
      );
      if (!event.navigateSuppressNavigation) {
        $tw.wiki.addToHistory(
          event.navigateTo,
          event.navigateFromClientRect,
          windowTitle
        );
        //$tw.Volant.pushTiddlerToZStack(windowTitle);
      }
    },

    addToBaseStoryList: function(tiddlerTitleToAdd, event, navigate = true) {
      const riverPositions = $tw.Mentat.getRiverPositions();
      // Add tiddler to $:/StoryList (and navigate to it)
      $tw.wiki.addToStory(
        tiddlerTitleToAdd,
        event.navigateFromTitle,
        "$:/StoryList",
        riverPositions
      );
      if (navigate && !event.navigateSuppressNavigation) {
        $tw.wiki.addToHistory(
          tiddlerTitleToAdd,
          event.navigateFromClientRect,
          "$:/HistoryList"
        );
      }
    },

    getRiverPositions: function() {
      const riverPositions = {
        openLinkFromInsideRiver:
          $tw.wiki.getTiddler("$:/config/Navigation/openLinkFromInsideRiver")
            .fields.text || "top",
        openLinkFromOutsideRiver:
          $tw.wiki.getTiddler("$:/config/Navigation/openLinkFromOutsideRiver")
            .fields.text || "top"
      };
      return riverPositions;
    },

    maintainStoryList: function() {
      let allowedTitles = [];
      for (let tag of $tw.Mentat.allowedTags) {
        const titles = $tw.wiki.getTiddlersWithTag(tag);
        allowedTitles = allowedTitles.concat(titles);
      }
      const storyTiddler = $tw.wiki.getTiddler("$:/StoryList");
      let storyList = storyTiddler.fields.list.filter(title =>
        allowedTitles.includes(title)
      );
      $tw.wiki.addTiddler(
        new $tw.Tiddler({ title: "$:/StoryList" }, { list: storyList })
      );
    },

    generateDraftTitle: function(title) {
      var c = 0,
        draftTitle,
        username = $tw.wiki.getTiddlerText("$:/status/UserName"),
        attribution = username ? " by " + username : "";
      do {
        draftTitle =
          "Draft " +
          (c ? c + 1 + " " : "") +
          "of '" +
          title +
          "'" +
          attribution;
        c++;
      } while ($tw.wiki.tiddlerExists(draftTitle));
      return draftTitle;
    },

    updateAllowedTags: function() {
      const M = $tw.Mentat;
      // Determine if default volant tagged tiddlers should be allowed on $:/StoryList
      const volantEnabled =
        $tw.wiki.getTiddler("$:/plugins/admls/volant/config/values").fields[
          "default-functionality"
        ] === "on"
          ? true
          : false;
      if (volantEnabled) {
        const fixedTag = "$:/Volant";
        const absoluteTag = "$:/VolantAbsolute";
        if (!M.allowedTags.includes(fixedTag)) {
          M.allowedTags.push(fixedTag);
        }
        if (!M.allowedTags.includes(absoluteTag)) {
          M.allowedTags.push(absoluteTag);
        }
      }
      const engineEnabled =
        $tw.wiki.getTiddler("$:/plugins/admls/engine/config/options").fields[
          "enabled"
        ] === "yes"
          ? true
          : false;
      if (engineEnabled) {
        const engineTag = "$:/Engine";
        if (!M.allowedTags.includes(engineTag)) {
          M.allowedTags.push(engineTag);
        }
      }
    }
  };

  /* Exports to be added to the global $tw */
  exports.Mentat = Mentat;

  /* Add some eventListeners */
  if ($tw.browser) {
    function handleScrollInWindowTabs(e) {
      // console.log(e);
      let elmnt = e.target;
      while (elmnt && !elmnt.matches(".window-tabs")) {
        elmnt = elmnt.parentElement;
      }
      if (!elmnt) {
        return;
      }
      // If not shiftKey, scroll throught the tabs
      if (!e.shiftKey && e.deltaY != 0) {
        const scrollInterval = e.deltaY > 0 ? 40 : -40;
        elmnt.scroll(elmnt.scrollLeft + scrollInterval, elmnt.scrollTop);
        // prevent vertical scroll
        e.preventDefault();
      }
      // If shiftKey, change width of tab
      if (e.shiftKey && e.deltaY != 0) {
        const tabWidthIncrease = e.deltaY > 0 ? -10 : 10;
        const configTitle = "$:/plugins/admls/mentat/config/values";
        const tiddler = $tw.wiki.getTiddler(configTitle);
        const newTabWidth =
          Number(tiddler.getFieldString("scroll-tab-width")) + tabWidthIncrease;
        $tw.wiki.setText(
          configTitle,
          "scroll-tab-width",
          undefined,
          newTabWidth,
          undefined
        );
        e.preventDefault();
      }
      return;
    }

    window.addEventListener("wheel", handleScrollInWindowTabs, true);
  }

  /* Add some hooks */
  $tw.hooks.addHook("th-navigating", function(event) {
    const M = $tw.Mentat;

    const baseStoryView = $tw.wiki.getTiddler("$:/view").fields.text;
    if (baseStoryView === "mentat") {
      const toTitle = event.navigateTo;
      const widget = event.navigateFromNode;

      let toTitleTiddler = $tw.wiki.getTiddler(toTitle);

      // Allow volant tiddlers with volant tags to be added to $:/StoryList if default functionality is "on"
      M.updateAllowedTags();

      if (toTitleTiddler && toTitleTiddler.fields.tags) {
        // If toTitleTiddler is tagged with any of the allowable tags
        for (let tag of toTitleTiddler.fields.tags) {
          if (M.allowedTags.includes(tag)) {
            // Add tiddler to $:/StoryList (and navigate to it) regardless of the scope of the widget
            M.addToBaseStoryList(toTitle, event);
            // Remove the tiddler from the window if the navigation began there
            const fromTiddler = $tw.wiki.getTiddler(event.navigateFromTitle);
            if (
              fromTiddler &&
              fromTiddler.fields.tags &&
              fromTiddler.fields.tags.includes("$:/Window")
            ) {
              // Get the window storyList
              let storyList = fromTiddler.fields.list
                ? fromTiddler.fields.list.slice()
                : [];
              // Remove toTitle from the window storyList
              let p = storyList.indexOf(toTitle);
              while (p !== -1) {
                storyList.splice(p, 1);
                p = storyList.indexOf(toTitle);
              }
              // Save the window
              $tw.wiki.addTiddler(
                new $tw.Tiddler(
                  { title: event.navigateFromTitle },
                  fromTiddler,
                  { list: storyList }
                )
              );
            }
            // Don't add the tiddler to the same story list that obtains in the scope of the widget
            return {};
          }
        }
      }

      // Make sure $:/StoryList is up to date
      M.maintainStoryList();

      if (toTitle) {
        // Get $:/StoryList
        const baseStoryTiddler = $tw.wiki.getTiddler("$:/StoryList");
        const baseStoryList = baseStoryTiddler.fields.list;

        // Get all window tiddlers
        let windowTitles = $tw.wiki.getTiddlersWithTag("$:/Window");

        // Search to see if the toTitle tiddler is already in the story list of a window
        if (!(event.shiftKey || event.altKey)) {
          // Don't search in other windows if the shiftKey or altKey were pressed
          const windowsContainingToTitle = [];
          windowTitles.forEach(windowTitle => {
            const windowTiddler = $tw.wiki.getTiddler(windowTitle);
            if (
              windowTiddler &&
              windowTiddler.fields.list &&
              windowTiddler.fields.list.includes(toTitle)
            ) {
              windowsContainingToTitle.push(windowTitle);
            }
          });
          // If some window already contains toTitle, navigate to it
          if (windowsContainingToTitle.length > 0) {
            windowTitles = windowsContainingToTitle;
            let windowTitle = M.getTopWindow(
              windowsContainingToTitle,
              baseStoryList
            );
            // Add window to $:/StoryList (and navigate to it)
            M.addToBaseStoryList(windowTitle, event);
            // Add toTitle to the window (and navigate to it)
            M.addToWindow(event, windowTitle);
            // Wherever the original navigation event came from, ignore it
            return {};
          }
        }

        // Get the top window per the $:/StoryList and the zstack
        let windowTitle = M.getTopWindow(windowTitles, baseStoryList);

        // Check to see if the navigation came from within a window
        let elmnt = widget.parentDomNode;
        while (elmnt && !elmnt.matches('[data-tags*="$:/Window"]')) {
          elmnt = elmnt.parentElement;
        }
        // If the navigation did come from within a window, stay within the window
        if (elmnt) {
          windowTitle = elmnt.dataset.tiddlerTitle;
        }

        // if windowTitle isn't a tiddler or the shiftKey was pressed
        if (
          !$tw.wiki.tiddlerExists(windowTitle) ||
          !windowTitle ||
          event.shiftKey
        ) {
          // Add a window to the tiddler store to put the toTitle tiddler in
          windowTitle = M.createWindow();
        }

        // Add windowTitle to the $:/StoryList
        M.addToBaseStoryList(windowTitle, event);
        // Add toTitle to windowTitle
        M.addToWindow(event, windowTitle);
        // Wherever the original navigation event came from, ignore it
        return {};
      }
    }
    // If view is not mentat, navigate as normal
    return event;
  });
})();
