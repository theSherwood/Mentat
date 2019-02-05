/*\
created: 20190201191521777
type: application/javascript
title: $:/plugins/admls/volant/commands/macro.js
tags: unfinished tampered
modified: 20190205220211312
module-type: macro
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.name = "volant";

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
    resizerLeft.style.position = "fixed";
    const resizerRight = document.createElement("div");
    resizerRight.className = "resizer resizer-right";
	resizerRight.style.position = "fixed";

	if(position === "absolute") {
    	resizerLeft.className += ' ' + 'absolute';
        resizerRight.className += ' ' + 'absolute';
    } 

	tiddler.appendChild(resizerLeft);
    tiddler.appendChild(resizerRight);

	tiddler.addEventListener("mousedown", $tw.Volant.startDrag, false);
    tiddler.addEventListener("mousedown", $tw.Volant.pushEventToZStack, false);
    tiddler.addEventListener("mousedown", $tw.Volant.startResize, false);
    if(position === "absolute") {
    	window.addEventListener("scroll", $tw.Volant.repositionResizersOnAbsolute, false);
    }
    
    $tw.Volant.snapToGrid(tiddler);
    $tw.Volant.logNewDimensions(tiddler);
    $tw.Volant.pushTiddlerToZStack(tiddler);

  	
};

})();
