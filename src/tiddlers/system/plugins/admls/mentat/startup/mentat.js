/*\
created: 20190220195956481
type: application/javascript
title: $:/plugins/admls/mentat/startup/mentat.js
tags: 
modified: 20190220222358374
module-type: startup

Add navigation hooks.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// Export name and synchronous status
exports.name = "mentat";
exports.after = ["startup"];
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
				const zStack = $tw.Volant.zStack;
				let topWindow = zStack.filter(tiddler => tiddler.matches('[data-tags*="Window"]')).slice(-1)[0];
				// Check to see if the navigation came from within a window
				const widget = event.navigateFromNode;
				let elmnt = widget.parentDomNode;
				while(elmnt && !elmnt.matches('[data-tags*="Window"]')) {
					elmnt = elmnt.parentElement;
				}
				// If the navigation did come from within a window, stay within the window
				if(elmnt) {
					topWindow = elmnt;
				}
				// console.log('TOPWINDOW',topWindow);
				if(topWindow && event.navigateTo) {
					const title = event.navigateTo;
					const fromTitle = event.navigateFromTitle;
					const storyTitle = topWindow.dataset.tiddlerTitle;
					const fromInside = $tw.wiki.getTiddler("$:/config/Navigation/openLinkFromInsideRiver").fields.text || "top";
					const fromOutside = $tw.wiki.getTiddler("$:/config/Navigation/openLinkFromOutsideRiver").fields.text || "top";
					$tw.wiki.addToStory(title,fromTitle,storyTitle,{openLinkFromInsideRiver: fromInside,openLinkFromOutsideRiver: fromOutside});
					if(!event.navigateSuppressNavigation) {
						$tw.wiki.addToHistory(event.navigateTo,event.navigateFromClientRect,storyTitle);
						$tw.Volant.pushTiddlerToZStack(topWindow);
					}
				
				}
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
