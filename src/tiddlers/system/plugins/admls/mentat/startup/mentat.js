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

		// let widget = event.navigateFromNode;
		// while(widget && !(widget.storyViewName)) {
		// 	widget = widget.parentWidget;
		// }
		// const innerView = widget ? widget.storyViewName : null;

		const title = event.navigateTo;
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
				const originStoryTitle = widget.getVariable("tv-story-list") || "$:/StoryList";
				const originStoryTiddler = $tw.wiki.getTiddler(originStoryTitle);
				const originStoryList = originStoryTiddler.fields.list;
				// Get the top-most window that's on the zStack and still in the story list
				const zStack = $tw.Volant.zStack;
				const windowsOnStack = zStack.filter(tiddler => tiddler.matches('[data-tags*="Window"]'));
				const windowTitles = windowsOnStack.map(window => window.dataset.tiddlerTitle);
				const windowsInStory = windowTitles.filter(windowTitle => originStoryList.includes(windowTitle))
				let windowTitle = windowsInStory.slice(-1)[0];
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
				if(!windowTitle) {
					// Add a window to the story to put the navigateTarget in
					const timestamp = $tw.utils.formatDateString(new Date(),"YY0MM0DD0hh0mm0ss0XXX");
					windowTitle = "Window-" + timestamp;			
					const windowTiddler = new $tw.Tiddler({
						title: windowTitle,
						tags: "Window",
						view: "classic" // make this configurable
					});
					$tw.wiki.addTiddler(windowTiddler);
					$tw.wiki.addToStory(windowTitle,fromTitle,originStoryTitle,{openLinkFromInsideRiver: fromInside,openLinkFromOutsideRiver: fromOutside});
					if(!event.navigateSuppressNavigation) {
						$tw.wiki.addToHistory(windowTitle,event.navigateFromClientRect,originStoryTitle);
					}
				}
				if(windowTitle) {
					// Add the navigateTarget to the window
					//const innerStoryTitle = windowTitle.dataset.tiddlerTitle;
					$tw.wiki.addToStory(title,fromTitle,windowTitle,{openLinkFromInsideRiver: fromInside,openLinkFromOutsideRiver: fromOutside});
					if(!event.navigateSuppressNavigation) {
						$tw.wiki.addToHistory(event.navigateTo,event.navigateFromClientRect,windowTitle);
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
