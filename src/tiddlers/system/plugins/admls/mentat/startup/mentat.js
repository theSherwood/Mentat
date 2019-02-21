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
		const fromInside = $tw.wiki.getTiddler("$:/config/Navigation/openLinkFromInsideRiver").fields.text || "top";
		const fromOutside = $tw.wiki.getTiddler("$:/config/Navigation/openLinkFromOutsideRiver").fields.text || "top";

		const baseView = $tw.wiki.getTiddler("$:/view").fields.text;
		//event.navigateFromNode.variables[""]
    	if(baseView === "mentat") {
			let navigateTarget = $tw.wiki.getTiddler(event.navigateTo);
			//console.log('navigateTarget',navigateTarget);
            if(navigateTarget && navigateTarget.fields.tags && (navigateTarget.fields.tags.includes("Mentat") || navigateTarget.fields.tags.includes("Window"))) {
            	//console.log('MENTAT OR WINDOW: TRUE',event);
            	return event;
            } else if (navigateTarget) {
				//console.log('MENTAT OR WINDOW: FALSE',event);
				const widget = event.navigateFromNode;
				const originHistoryTitle = widget.getVariable("tv-history-list") || "$:/HistoryList";
				const originStoryTitle = widget.getVariable("tv-story-list") || "$:/StoryList";
				const originStoryTiddler = $tw.wiki.getTiddler(originStoryTitle);
				const originStoryList = originStoryTiddler.fields.list;

				// Get all window tiddlers
				let windowTitles = $tw.wiki.getTiddlersWithTag("Window");
				// Filter zStack by windowTitles
				const zStackTitles = $tw.Volant.zStack.map(tiddler => tiddler.dataset.tiddlerTitle);
				console.log('ZSTACK',zStackTitles);
				const windowsOnStack = zStackTitles.filter(windowTitle => windowTitles.includes(windowTitle));
				console.log("WINDOWS ON STACK", windowsOnStack.slice(-1)[0]);
				// Filter story list by windowTitles
				const windowsInStory = originStoryList.filter(windowTitle => windowTitles.includes(windowTitle));
				console.log("WINDOWS IN STORY", windowsInStory.slice(-1)[0]);
				// Filter windowsOnStack by windowsInStory and get the one at the top of the stack
				const preferredWindow = windowsOnStack.filter(windowTitle => windowsInStory.includes(windowTitle)).slice(-1)[0];
				console.log("PREFERRED WINDOW", preferredWindow);

				let windowTitle = preferredWindow || windowsInStory.slice(-1)[0] || windowsOnStack.slice(-1)[0] || windowTitles.slice(-1)[0];

				// windowTitles = windowsOnStack.map(window => window.dataset.tiddlerTitle);
				// windowTitles = windowTitles.filter(title => $tw.wiki.tiddlerExists(title));
				/*
				Uncomment the following line if it should only use tiddlers currently open 
				(in a story list)
				*/
				// windowTitles = windowTitles.filter(windowTitle => originStoryList.includes(windowTitle))
			
				// Check to see if the navigation came from within a window
				let elmnt = widget.parentDomNode;
				while(elmnt && !elmnt.matches('[data-tags*="Window"]')) {
					elmnt = elmnt.parentElement;
				}
				// If the navigation did come from within a window, stay within the window
				if(elmnt) {
					windowTitle = elmnt.dataset.tiddlerTitle;
				}
				// console.log('windowTitle',windowTitle);
				if(!$tw.wiki.tiddlerExists(windowTitle) || !windowTitle) {
					// Add a window to the story to put the navigateTarget in
					const timestamp = $tw.utils.formatDateString(new Date(),"YY0MM0DD0hh0mm0ss0XXX");
					windowTitle = "Window-" + timestamp;			
					const windowTiddler = new $tw.Tiddler({
						title: windowTitle,
						tags: "Window",
						view: "classic" // make this configurable
					});
					$tw.wiki.addTiddler(windowTiddler);
				}
				if(!originStoryList.includes(windowTitle)) {
					// If the window isn't open, add it to the story
					$tw.wiki.addToStory(windowTitle,fromTitle,originStoryTitle,{openLinkFromInsideRiver: fromInside,openLinkFromOutsideRiver: fromOutside});
					if(!event.navigateSuppressNavigation) {
						$tw.wiki.addToHistory(windowTitle,event.navigateFromClientRect,originHistoryTitle);
					}	
				}
				if(windowTitle) {
					// Add the navigateTarget to the window
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
    	//console.log('VIEW IS NOT MENTAT',event);
        return event;
    });
    
}

})();
