/*\
created: 20190201191521777
type: application/javascript
title: $:/plugins/admls/mentat/commands/macro.js
tags: unfinished tampered
modified: 20190201225803872
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

	const cLog = function(e) {
    	console.log(e.target.className);
   }

	elmnt.addEventListener("mousedown", $tw.Weird.startDrag, false);
    elmnt.addEventListener("mousedown", $tw.Weird.pushZStack, false);
    
    elmnt.querySelectorAll(".resizer-left, .resizer-right").forEach(function(resizer) {
    	resizer.addEventListener("mousedown", $tw.Weird.startResize, false);
    });

  	
};

})();
