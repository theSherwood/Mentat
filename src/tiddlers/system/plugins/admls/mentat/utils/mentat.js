/*\
created: 20190130100248791
type: application/javascript
title: $:/plugins/admls/mentat/utils/mentat.js
tags: tampered
modified: 20190201190659763
module-type: utils

Various static DOM-related utility functions.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";
    
// Test eventListener for the window
function dragListener(e) {
/*\
    // Install CodeMirror
    if($tw.browser && !window.Weird) {

        var modules = $tw.modules.types["codemirror"];
        var req = Object.getOwnPropertyNames(modules);

        window.Weird = require("$:/plugins/admls/mentat/lib/fakeName.js").Weird;
    }


	const elmnt = e.target;
    
	if(elmnt.dataset.tags && elmnt.dataset.tags.includes("testingStyle") || elmnt.classList.contains("resizer-left") || elmnt.classList.contains("resizer-right")) {
 
      	const Weird = require("$:/plugins/admls/mentat/lib/fakeName.js").Weird;
        //console.log(Weird.key);
        //console.log(Weird.zStack);
        //console.log(Weird.log(elmnt));
           \*/
    	$tw.Weird.dragMouseDown(e);
    //}  
	};

exports.dragListener = dragListener;


})();