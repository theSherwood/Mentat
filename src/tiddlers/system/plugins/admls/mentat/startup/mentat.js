/*\
created: 20190220195956481
type: application/javascript
title: $:/plugins/admls/mentat/startup/mentat.js
tags: 
modified: 20190227183353369
module-type: startup

Add hooks.

\*/
(function () {

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	// Export name and synchronous status
	exports.name = "mentat";
	exports.after = ["story"];
	exports.synchronous = true;

	exports.startup = function () {
		addHooks()
	};

	function addHooks() {
		$tw.hooks.addHook("th-navigating", function (event) {

			const baseStoryView = $tw.wiki.getTiddler("$:/view").fields.text;
			if (baseStoryView === "mentat") {
				//console.log('INITIAL EVENT',event);
				const toTitle = event.navigateTo;
				const widget = event.navigateFromNode;


				// Make sure $:/StoryList is up to date
				maintainStoryList();

				let toTitleTiddler = $tw.wiki.getTiddler(toTitle);
				// If toTitleTiddler is tagged $:/Window or Mentat
				if (toTitleTiddler && toTitleTiddler.fields.tags && (toTitleTiddler.fields.tags.includes("Mentat") || toTitleTiddler.fields.tags.includes("$:/Window"))) {
					// Add tiddler to $:/StoryList (and navigate to it) regardless of the scope of the widget
					addToBaseStoryList(toTitle, event);
					// Don't add the tiddler to the same story list that obtains in the scope of the widget
					return {};
				} else if (toTitle) {
					// Get $:/StoryList
					const baseStoryTiddler = $tw.wiki.getTiddler("$:/StoryList");
					const baseStoryList = baseStoryTiddler.fields.list;

					// Get all window tiddlers
					let windowTitles = $tw.wiki.getTiddlersWithTag("$:/Window");

					// Search to see if the toTitle tiddler is already in the story list of a window
					const windowsContainingToTitle = []
					windowTitles.forEach(windowTitle => {
						const windowTiddler = $tw.wiki.getTiddler(windowTitle);
						if (windowTiddler && windowTiddler.fields.list && windowTiddler.fields.list.includes(toTitle)) {
							windowsContainingToTitle.push(windowTitle);
						}
					});
					// If some window already contains toTitle, navigate to it
					if (windowsContainingToTitle.length > 0) {
						windowTitles = windowsContainingToTitle;
						let windowTitle = getTopWindow(windowsContainingToTitle, baseStoryList);
						// Add window to $:/StoryList (and navigate to it)
						addToBaseStoryList(windowTitle, event);
						// Add toTitle to the window (and navigate to it)
						addToWindow(event, windowTitle);
						// Wherever the original navigation event came from, ignore it
						return {};
					}

					let windowTitle = getTopWindow(windowTitles, baseStoryList);

					// Check to see if the navigation came from within a window
					let elmnt = widget.parentDomNode;
					while (elmnt && !elmnt.matches('[data-tags*="$:/Window"]')) {
						elmnt = elmnt.parentElement;
					}
					// If the navigation did come from within a window, stay within the window
					if (elmnt) {
						windowTitle = elmnt.dataset.tiddlerTitle;
					}

					// if windowTitle isn't a tiddler
					if (!$tw.wiki.tiddlerExists(windowTitle) || !windowTitle) {
						// Add a window to the tiddler store to put the toTitle tiddler in
						windowTitle = createWindow();
					}

					// Add windowTitle to the $:/StoryList
					addToBaseStoryList(windowTitle, event);
					// Add toTitle to windowTitle
					addToWindow(event, windowTitle);
					// Wherever the original navigation event came from, ignore it
					return {};
				}
			}
			// If view is not mentat, navigate as normal
			return event;
		});

		function getTopWindow(windowTitles, storyList) {
			// Filter zStack by windowTitles
			const zStackTitles = $tw.Volant.zStack.map(tiddler => tiddler.dataset.tiddlerTitle);
			const windowsOnStack = zStackTitles.filter(windowTitle => windowTitles.includes(windowTitle));
			// Filter story list by windowTitles
			const windowsInStory = storyList.filter(windowTitle => windowTitles.includes(windowTitle));
			// Filter windowsOnStack by windowsInStory and get the one at the top of the stack
			const preferredWindow = windowsOnStack.filter(windowTitle => windowsInStory.includes(windowTitle)).slice(-1)[0];
			const topWindow = preferredWindow || windowsInStory.slice(-1)[0] || windowsOnStack.slice(-1)[0] || windowTitles.slice(-1)[0];
			return topWindow;
		};

		function createWindow() {
			// Add a window to the tiddler store
			let windowTitle = $tw.wiki.generateNewTitle("$:/Window")
			const windowTiddler = new $tw.Tiddler({
				title: windowTitle,
				tags: "$:/Window $:/config/Volant",
				view: $tw.wiki.getTiddler("$:/plugins/admls/mentat/config/values").fields["default-window-storyview"] || "classic"
			});
			$tw.wiki.addTiddler(windowTiddler);
			return windowTitle;
		};

		function addToWindow(event, windowTitle) {
			const riverPositions = getRiverPositions();
			// Add the toTitleTiddler to the window
			$tw.wiki.addToStory(event.navigateTo, event.navigateFromTitle, windowTitle, riverPositions);
			if (!event.navigateSuppressNavigation) {
				$tw.wiki.addToHistory(event.navigateTo, event.navigateFromClientRect, windowTitle);
				//$tw.Volant.pushTiddlerToZStack(windowTitle);
			}
		};

		function addToBaseStoryList(tiddlerTitleToAdd, event, navigate = true) {
			const riverPositions = getRiverPositions();
			// Add tiddler to $:/StoryList (and navigate to it)
			$tw.wiki.addToStory(tiddlerTitleToAdd, event.navigateFromTitle, "$:/StoryList", riverPositions);
			if (navigate && !event.navigateSuppressNavigation) {
				$tw.wiki.addToHistory(tiddlerTitleToAdd, event.navigateFromClientRect, "$:/HistoryList");
			}
		};

		function getRiverPositions() {
			const riverPositions = {
				openLinkFromInsideRiver: $tw.wiki.getTiddler("$:/config/Navigation/openLinkFromInsideRiver").fields.text || "top",
				openLinkFromOutsideRiver: $tw.wiki.getTiddler("$:/config/Navigation/openLinkFromOutsideRiver").fields.text || "top"
			}
			return riverPositions;
		};

		function maintainStoryList() {
			// Make sure $:/StoryList is up to date (filtered of everything not Mentat or $:/Window)
			const windowTitles = $tw.wiki.getTiddlersWithTag("$:/Window");
			const mentatTitles = $tw.wiki.getTiddlersWithTag("Mentat");
			const storyTiddler = $tw.wiki.getTiddler("$:/StoryList");
			let storyList = storyTiddler.fields.list.filter(title => (mentatTitles.includes(title) || windowTitles.includes(title)));
			$tw.wiki.addTiddler(new $tw.Tiddler(
				{ title: "$:/StoryList" },
				{ list: storyList }
			));
		};

		function generateDraftTitle(title) {
			var c = 0,
				draftTitle,
				username = $tw.wiki.getTiddlerText("$:/status/UserName"),
				attribution = username ? " by " + username : "";
			do {
				draftTitle = "Draft " + (c ? (c + 1) + " " : "") + "of '" + title + "'" + attribution;
				c++;
			} while ($tw.wiki.tiddlerExists(draftTitle));
			return draftTitle;
		};


	}

})();
