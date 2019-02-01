/*\
created: 20190201191521777
type: application/javascript
title: $:/plugins/admls/mentat/commands/macro.js
tags: unfinished tampered
modified: 20190201211233635
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

    while(!(elmnt.dataset.tiddlerTitle) ) {
    	if(elmnt.tagName === "HTML") {
        	return;
        }
    	elmnt = elmnt.parentElement;
   	}

	elmnt.addEventListener("mousedown", $tw.Weird.startDrag, false);
    //elmnt.addEventListener("mousedown", $tw.Weird.pushZStack, false);

  	
};

})();
