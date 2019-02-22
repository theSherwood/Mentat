/*\
created: 20190220195956481
type: application/javascript
title: $:/plugins/admls/mentat/startup/mentat.js
tags: 
modified: 20190221170232160
module-type: startup

Add navigation hooks.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// Export name and synchronous status
exports.name = "mentat";
exports.after = ["story"];
exports.synchronous = true;

exports.startup = function() {
    addNavigationHooks()   
};

function addNavigationHooks() {
	$tw.hooks.addHook("th-navigating", function(event) {
		console.log('INITIAL EVENT',event);

		const toTitle = event.navigateTo;
		const fromTitle = event.navigateFromTitle;
		const widget = event.navigateFromNode;
		const fromInside = $tw.wiki.getTiddler("$:/config/Navigation/openLinkFromInsideRiver").fields.text || "top";
		const fromOutside = $tw.wiki.getTiddler("$:/config/Navigation/openLinkFromOutsideRiver").fields.text || "top";

		const baseStoryView = $tw.wiki.getTiddler("$:/view").fields.text;
    	if(baseStoryView === "mentat") {
			let toTitleTiddler = $tw.wiki.getTiddler(toTitle);
			// If toTitleTiddler is tagged Window or Mentat
            if(toTitleTiddler && toTitleTiddler.fields.tags && (toTitleTiddler.fields.tags.includes("Mentat") || toTitleTiddler.fields.tags.includes("Window"))) {
				$tw.wiki.addToStory(toTitle,fromTitle,"$:/StoryList",{openLinkFromInsideRiver: fromInside,openLinkFromOutsideRiver: fromOutside});
				if(!event.navigateSuppressNavigation) {
					$tw.wiki.addToHistory(toTitle,event.navigateFromClientRect,"$:/HistoryList");
					//$tw.Volant.pushTiddlerToZStack(toTitle);
				}
				// Don't add the tiddler to the outer story list
            	const emptyEvent = {
					type: "tm-navigate"
				}
				return emptyEvent;
				
            } else if (toTitle) {
				// Get all window tiddlers
				let windowTitles = $tw.wiki.getTiddlersWithTag("Window");

				// Search to see if the toTitle tiddler is already in the story list of a window
				const windowsContainingToTitle = []
				windowTitles.forEach(windowTitle => {
					const windowTiddler = $tw.wiki.getTiddler(windowTitle);
					if(windowTiddler && windowTiddler.fields.list && windowTiddler.fields.list.includes(toTitle)) {
						windowsContainingToTitle.push(windowTitle);
					}
				})
				let toTitleAlreadyInWindow;
				if(windowsContainingToTitle.length > 0) {
					windowTitles = windowsContainingToTitle;
					toTitleAlreadyInWindow = true;
				}

				// Get story information from the widget that dispatched the event
				const originHistoryTitle = widget.getVariable("tv-history-list") || "$:/HistoryList";
				const originStoryTitle = widget.getVariable("tv-story-list") || "$:/StoryList";
				let originStoryTiddler = $tw.wiki.getTiddler(originStoryTitle);
				let originStoryList = originStoryTiddler.fields.list;

				// Filter zStack by windowTitles
				const zStackTitles = $tw.Volant.zStack.map(tiddler => tiddler.dataset.tiddlerTitle);
				const windowsOnStack = zStackTitles.filter(windowTitle => windowTitles.includes(windowTitle));
				// Filter story list by windowTitles
				const windowsInStory = originStoryList.filter(windowTitle => windowTitles.includes(windowTitle));
				// Filter windowsOnStack by windowsInStory and get the one at the top of the stack
				const preferredWindow = windowsOnStack.filter(windowTitle => windowsInStory.includes(windowTitle)).slice(-1)[0];

				let windowTitle = preferredWindow || windowsInStory.slice(-1)[0] || windowsOnStack.slice(-1)[0] || windowTitles.slice(-1)[0];

				if(toTitleAlreadyInWindow) {
					// Add (and navigate) to the window
					$tw.wiki.addToStory(windowTitle,fromTitle,"$:/StoryList",{openLinkFromInsideRiver: fromInside,openLinkFromOutsideRiver: fromOutside});
					if(!event.navigateSuppressNavigation) {
						$tw.wiki.addToHistory(windowTitle,event.navigateFromClientRect,originHistoryTitle);
					}
					// Add (and navigate) to toTitle within the window
					$tw.wiki.addToStory(toTitle,fromTitle,windowTitle,{openLinkFromInsideRiver: fromInside,openLinkFromOutsideRiver: fromOutside});
					if(!event.navigateSuppressNavigation) {
						$tw.wiki.addToHistory(toTitle,event.navigateFromClientRect,windowTitle);
						//$tw.Volant.pushTiddlerToZStack(windowTitle);
					}
					// Don't add the tiddler to the outer story list
					const emptyEvent = {
						type: "tm-navigate"
					}
					return emptyEvent;
				}
			
				// Check to see if the navigation came from within a window
				let elmnt = widget.parentDomNode;
				while(elmnt && !elmnt.matches('[data-tags*="Window"]')) {
					elmnt = elmnt.parentElement;
				}
				// If the navigation did come from within a window, stay within the window
				if(elmnt) {
					windowTitle = elmnt.dataset.tiddlerTitle;
				}

				if(!$tw.wiki.tiddlerExists(windowTitle) || !windowTitle) {
					// Add a window to the story to put the toTitle tiddler in
					const timestamp = $tw.utils.formatDateString(new Date(),"YY0MM0DD0hh0mm0ss0XXX");
					windowTitle = "Window-" + timestamp;			
					const windowTiddler = new $tw.Tiddler({
						title: windowTitle,
						tags: "Window",
						view: $tw.wiki.getTiddler("$:/plugins/admls/mentat/config/values").field["default-window-storyview"] || "classic"
					});
					$tw.wiki.addTiddler(windowTiddler);
				}
				// Get an updated story list
				originStoryTiddler = $tw.wiki.getTiddler(originStoryTitle);
				originStoryList = originStoryTiddler.fields.list;
				if((originStoryTitle !== windowTitle) && !originStoryList.includes(windowTitle)) {
					// If the window isn't open, add it to the story
					$tw.wiki.addToStory(windowTitle,fromTitle,originStoryTitle,{openLinkFromInsideRiver: fromInside,openLinkFromOutsideRiver: fromOutside});
					if(!event.navigateSuppressNavigation) {
						$tw.wiki.addToHistory(windowTitle,event.navigateFromClientRect,originHistoryTitle);
					}	
				}
				if(windowTitle) {
					// Add the toTitleTiddler to the window
					$tw.wiki.addToStory(toTitle,fromTitle,windowTitle,{openLinkFromInsideRiver: fromInside,openLinkFromOutsideRiver: fromOutside});
					if(!event.navigateSuppressNavigation) {
						$tw.wiki.addToHistory(toTitle,event.navigateFromClientRect,windowTitle);
						//$tw.Volant.pushTiddlerToZStack(windowTitle);
					}
				}
				// Don't add the tiddler to the outer story list
				const emptyEvent = {
					type: "tm-navigate"
				}
            	return emptyEvent;
            }
		}
		// If view is not mentat, navigate as normal
        return event;
    });
    
}

})();
