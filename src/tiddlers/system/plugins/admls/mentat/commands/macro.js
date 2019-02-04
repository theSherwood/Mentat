/*\
created: 20190201191521777
type: application/javascript
title: $:/plugins/admls/mentat/commands/macro.js
tags: unfinished tampered
modified: 20190204233346296
module-type: macro
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.name = "movingTiddler";

exports.params = [
  { name: "position", default: "fixed" }
];

exports.run = function(position) {
	position = (position === "absolute") ? position : "fixed";
	let elmnt = this.parentDomNode;
	// Get the tiddler element that this macro runs in
    while(!(elmnt.dataset.tiddlerTitle) ) {
    	if(elmnt.tagName === "HTML") {
        	return;
        }
    	elmnt = elmnt.parentElement;
   	}
    
    const tiddler = elmnt;
    tiddler.style.position = position;
    
    const resizerLeft = document.createElement("div");
    resizerLeft.className = "resizer resizer-left";
    resizerLeft.style.position = position;
    const resizerRight = document.createElement("div");
    resizerRight.className = "resizer resizer-right";
    resizerRight.style.position = position;
	tiddler.appendChild(resizerLeft);
    tiddler.appendChild(resizerRight);

	tiddler.addEventListener("mousedown", $tw.Weird.startDrag, false);
    tiddler.addEventListener("mousedown", $tw.Weird.getEventTiddler, false);
    tiddler.addEventListener("mousedown", $tw.Weird.startResize, false);
    if(position === "absolute") {
    	tiddler.addEventListener("scroll", $tw.Weird.repositionAbsoluteResizers, false);
    }
    
    $tw.Weird.logNewDimensions(tiddler);
    $tw.Weird.pushZStack(tiddler);

  	
};

})();
