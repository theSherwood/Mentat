/*\
created: 20190130100248791
type: application/javascript
title: $:/plugins/admls/mentat/utils/mentat.js
tags: tampered
modified: 20190130102954876
module-type: utils

Various static DOM-related utility functions.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.dragListener = function(e) {
	if(e.target.dataset.tags==="testingStyle"){	console.log($tw.utils.getBoundingPageRect(e.target));
		}
	};


exports.dragDelegatorListener = function() {
	$tw.utils.addEventListeners(document, [{
    	name: "click", handlerFunction: function(e) {
		if(e.target.dataset.tags==="testingStyle"){
console.log($tw.utils.getBoundingPageRect(e.target));
		}
	}
	}]);
	};

})();