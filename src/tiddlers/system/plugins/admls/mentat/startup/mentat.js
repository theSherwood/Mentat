/*\
created: 20190220195956481
type: application/javascript
title: $:/plugins/admls/mentat/startup/mentat.js
tags: 
modified: 20190221170232160
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
			//console.log('INITIAL EVENT',event);
			const toTitle = event.navigateTo;
			const widget = event.navigateFromNode;

			const baseStoryView = $tw.wiki.getTiddler("$:/view").fields.text;
			if (baseStoryView === "mentat") {
				// Make sure $:/StoryList is up to date
				maintainStoryList();

				let toTitleTiddler = $tw.wiki.getTiddler(toTitle);
				// If toTitleTiddler is tagged Window or Mentat
				if (toTitleTiddler && toTitleTiddler.fields.tags && (toTitleTiddler.fields.tags.includes("Mentat") || toTitleTiddler.fields.tags.includes("Window"))) {
					// Add tiddler to $:/StoryList (and navigate to it) regardless of the scope of the widget
					addToBaseStoryList(toTitle, event);
					// Don't add the tiddler to the same story list that obtains in the scope of the widget
					return {};
				} else if (toTitle) {
					// Get $:/StoryList
					const baseStoryTiddler = $tw.wiki.getTiddler("$:/StoryList");
					const baseStoryList = baseStoryTiddler.fields.list;

					// Get all window tiddlers
					let windowTitles = $tw.wiki.getTiddlersWithTag("Window");

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
					while (elmnt && !elmnt.matches('[data-tags*="Window"]')) {
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

		$tw.hooks.addHook("th-new-tiddler", function (event) {
			console.log("NEW TIDDLER EVENT", event);

			const baseStoryView = $tw.wiki.getTiddler("$:/view").fields.text;
			if (baseStoryView === "mentat") {
				// Get $:/StoryList
				const baseStoryTiddler = $tw.wiki.getTiddler("$:/StoryList");
				const baseStoryList = baseStoryTiddler.fields.list;
				// Get all window tiddlers
				let windowTitles = $tw.wiki.getTiddlersWithTag("Window");
				let windowTitle = getTopWindow(windowTitles, baseStoryList);

				// Check to see if the new-tiddler event originated from within a window
				let elmnt = event.event.target;
				while (elmnt && !elmnt.matches('[data-tags*="Window"]')) {
					elmnt = elmnt.parentElement;
				}
				// If the new tiddler did come from within a window, return event
				if (elmnt) {
					// windowTitle = elmnt.dataset.tiddlerTitle;
					return event;
				}
				// If there is no windowTitle
				if (!$tw.wiki.tiddlerExists(windowTitle) || !windowTitle) {
					// Add a window to the tiddler store to put the toTitle tiddler in
					windowTitle = createWindow()
				}

				// Add windowTitle to $:/StoryList
				addToBaseStoryList(windowTitle, event);
				// windowTitle will be the storyList for the new tiddler
				let storyList = $tw.wiki.getTiddler(windowTitle).fields.list;
				storyList = $tw.wiki.getTiddlerList(storyList);

				// Get the details
				var templateTiddler, additionalFields;
				
				function getNewTitles(templateTiddler, additionalFields) {
					var title;
					var baseTitle;
					// Get the template tiddler (if any)
					if (typeof event.param === "string") {
						// Get the template tiddler
						templateTiddler = $tw.wiki.getTiddler(event.param);
						// Generate a baseTitle
						baseTitle = event.param || $tw.language.getString("DefaultNewTiddlerTitle");
						var c = 0,
						title = baseTitle;
						while($tw.wiki.tiddlerExists(title) || $tw.wiki.isShadowTiddler(title) || $tw.wiki.findDraft(title)) {
							title = baseTitle + " " + (++c);
						}
					}
					// Get the specified additional fields
					if (typeof event.paramObject === "object") {
						additionalFields = event.paramObject;
					}
					if (typeof event.param === "object") { // Backwards compatibility with 5.1.3
						additionalFields = event.param;
					}
					if (additionalFields && additionalFields.title) {
						title = additionalFields.title;
					}
					
					// Generate a title if one does not already exist
					if(!title) {
						var c = 0,
						baseTitle = $tw.language.getString("DefaultNewTiddlerTitle");
						title = baseTitle;
						while($tw.wiki.tiddlerExists(title) || $tw.wiki.isShadowTiddler(title) || $tw.wiki.findDraft(title)) {
							title = baseTitle + " " + (++c);
						}
					}
					return title;
				};

				var title = getNewTitles(templateTiddler, additionalFields);

				function getDraftObject(title) {
					// Find any existing draft for this tiddler
					let draftTitle = $tw.wiki.findDraft(title);
					// Pull in any existing tiddler
					let existingTiddler;
					if (draftTitle) {
						existingTiddler = $tw.wiki.getTiddler(draftTitle);
					} else {
						draftTitle = generateDraftTitle(title);
						existingTiddler = $tw.wiki.getTiddler(title);
					}
					return {
						draftTitle: draftTitle, 
						existingTiddler: existingTiddler
					};
				}
				var {draftTitle, existingTiddler} = getDraftObject(title);
				// Merge the tags
				var mergedTags = [];
				if (existingTiddler && existingTiddler.fields.tags) {
					$tw.utils.pushTop(mergedTags, existingTiddler.fields.tags);
				}
				if (additionalFields && additionalFields.tags) {
					// Merge tags
					mergedTags = $tw.utils.pushTop(mergedTags, $tw.utils.parseStringArray(additionalFields.tags));
				}
				if (templateTiddler && templateTiddler.fields.tags) {
					// Merge tags
					mergedTags = $tw.utils.pushTop(mergedTags, templateTiddler.fields.tags);
				}
				// Make a copy of the additional fields excluding any blank ones
				var filteredAdditionalFields = $tw.utils.extend({}, additionalFields);
				Object.keys(filteredAdditionalFields).forEach(function (fieldName) {
					if (filteredAdditionalFields[fieldName] === "") {
						delete filteredAdditionalFields[fieldName];
					}
				});
				// Save the draft tiddler
				var draftTiddler = new $tw.Tiddler({
					text: "",
					"draft.title": title
				},
					templateTiddler,
					additionalFields,
					$tw.wiki.getCreationFields(),
					existingTiddler,
					filteredAdditionalFields,
					{
						title: draftTitle,
						"draft.of": title,
						tags: mergedTags
					}, $tw.wiki.getModificationFields());
				$tw.wiki.addTiddler(draftTiddler);

				/*
				// Update the story to insert the new draft at the top and remove any existing tiddler
				if (storyList.indexOf(draftTitle) === -1) {
					var slot = storyList.indexOf(event.navigateFromTitle);
					if (slot === -1) {
						slot = $tw.wiki.getTiddler("$:/config/Navigation/openLinkFromOutsideRiver").fields.text === "bottom" ? storyList.length - 1 : slot;
					}
					storyList.splice(slot + 1, 0, draftTitle);
				}
				if (storyList.indexOf(title) !== -1) {
					storyList.splice(storyList.indexOf(title), 1);
				}
				*/

				
				const riverPositions = getRiverPositions();
				// Add the draft tiddler to the window
				$tw.wiki.addToStory(draftTitle, event.navigateFromTitle, windowTitle, riverPositions);
				$tw.wiki.addToHistory(draftTitle, event.navigateFromClientRect, windowTitle);
					//$tw.Volant.pushTiddlerToZStack(windowTitle);
				
				
				
				/*
				// Save story list on window
				var storyTiddler = $tw.wiki.getTiddler(windowTitle);
				$tw.wiki.addTiddler(new $tw.Tiddler(
					{title: windowTitle},
					storyTiddler,
					{list: storyList}
				));
				// Add a new record to the top of the history stack (on the window)
				$tw.wiki.addToHistory(draftTitle,undefined,windowTitle);
				*/	


				/*
				The current navigator widget's handling of tm-new-tiddler does not appear to be abortable
				by means of the hook, meaning that the following measures must be taken to undo the
				normal handling
				*/
				// Get the names of the new tiddlers that the event will generate
				const doppelgangerTitle = getNewTitles(templateTiddler, additionalFields);
				const {draftTitle: doppelDraft, existingTiddler: doppelExisting} = getDraftObject(doppelgangerTitle);

				setTimeout(() => {
					// delete doppelganger new draft created by normal new-tiddler process
					$tw.wiki.deleteTiddler(doppelgangerTitle);
					$tw.wiki.deleteTiddler(doppelDraft);
					maintainStoryList();
				}, 0)
				// Allow the event to pass to the navigator widget
				return event;
			}
			// If not mentat view, proceed normally
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
			const timestamp = $tw.utils.formatDateString(new Date(), "YY0MM0DD0hh0mm0ss0XXX");
			let windowTitle = "Window-" + timestamp;
			const windowTiddler = new $tw.Tiddler({
				title: windowTitle,
				tags: "Window",
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
			// Make sure $:/StoryList is up to date (filtered of everything not Mentat or Window)
			const windowTitles = $tw.wiki.getTiddlersWithTag("Window");
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
