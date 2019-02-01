/*\
created: 20190201191521777
type: application/javascript
title: $:/plugins/admls/mentat/commands/macro.js
tags: unfinished tampered
modified: 20190201220753996
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
	// Get the tiddler that this macro runs in
    while(!(elmnt.dataset.tiddlerTitle) ) {
    	if(elmnt.tagName === "HTML") {
        	return;
        }
    	elmnt = elmnt.parentElement;
   	}

	elmnt.addEventListener("mousedown", $tw.Weird.startDrag, false);
    elmnt.addEventListener("mousedown", $tw.Weird.pushZStack, false);

  	
};

})();
