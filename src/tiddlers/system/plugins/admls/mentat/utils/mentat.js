/*\
created: 20190130100248791
type: application/javascript
title: $:/plugins/admls/mentat/utils/mentat.js
tags: tampered
modified: 20190130104830377
module-type: utils

Various static DOM-related utility functions.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// Test eventListener for the window
exports.dragListener = function(e) {
	const elmnt = e.target;
	if(elmnt.dataset.tags==="testingStyle"){	console.log($tw.utils.getBoundingPageRect(elmnt));
		}
	};

})();