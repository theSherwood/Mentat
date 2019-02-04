/*\
created: 20190201191521777
type: application/javascript
title: $:/plugins/admls/mentat/commands/macro.js
tags: unfinished tampered
modified: 20190204172648354
module-type: macro
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.name = "movingTiddler";

exports.params = [];

exports.run = function() {
	let elmnt = this.parentDomNode;
	// Get the tiddler element that this macro runs in
    while(!(elmnt.dataset.tiddlerTitle) ) {
    	if(elmnt.tagName === "HTML") {
        	return;
        }
    	elmnt = elmnt.parentElement;
   	}
    
    const tiddler = elmnt;
    
    const resizerLeft = document.createElement("div");
    resizerLeft.className = "resizer resizer-left";
    const resizerRight = document.createElement("div");
    resizerRight.className = "resizer resizer-right";
	tiddler.appendChild(resizerLeft);
    tiddler.appendChild(resizerRight);

	tiddler.addEventListener("mousedown", $tw.Weird.startDrag, false);
    tiddler.addEventListener("mousedown", $tw.Weird.pushZStack, false);
    tiddler.addEventListener("mousedown", $tw.Weird.startResize, false);
    console.log(tiddler);
    $tw.Weird.logNewDimensions(tiddler);

  	
};

})();
