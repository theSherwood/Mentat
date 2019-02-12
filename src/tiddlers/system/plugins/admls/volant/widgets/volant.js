/*\
created: 20190212164359746
type: application/javascript
title: $:/plugins/admls/volant/widgets/volant.js
tags: 
modified: 20190212171902905
module-type: widget

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var VolantWidget = function(parseTreeNode, options) {
  this.initialise(parseTreeNode, options);
};
  
/* 
Inherit from the base widget class
 */
VolantWidget.prototype = new Widget();

/* 
Render this widget into the DOM. 
*/
VolantWidget.prototype.render = function(parent,nextSibling) {
    this.parentDomNode = parent;
    this.computeAttributes();
    this.execute();

    let elmnt = this.parentDomNode;
    // Get the tiddler element that this macro runs in
    while(!(elmnt.dataset.tiddlerTitle) ) {
      if(elmnt.tagName === "HTML") {
          return;
      }
      elmnt = elmnt.parentElement;
    } 
    const tiddler = elmnt;
    tiddler.style.position = this.position;
    
	const resizerLeft = document.createElement("div");
    resizerLeft.className = "resizer resizer-left";
    resizerLeft.style.position = "fixed";
    const resizerRight = document.createElement("div");
    resizerRight.className = "resizer resizer-right";
    resizerRight.style.position = "fixed";

    if(this.position === "absolute") {
    	resizerLeft.className += ' ' + 'absolute';
        resizerRight.className += ' ' + 'absolute';
    } 

    tiddler.appendChild(resizerLeft);
    tiddler.appendChild(resizerRight);

    tiddler.addEventListener("mousedown", $tw.Volant.startDrag, false);
    tiddler.addEventListener("mousedown", $tw.Volant.pushEventToZStack, false);
    tiddler.addEventListener("mousedown", $tw.Volant.startResize, false);
    if(this.position === "absolute") {
    	window.addEventListener("scroll", $tw.Volant.repositionResizersOnAbsolute, false);
    }
    
    $tw.Volant.snapToGrid(tiddler);
    $tw.Volant.logNewDimensions(tiddler);
    $tw.Volant.pushTiddlerToZStack(tiddler); 	
};

/*
Compute the internal state of this widget.
*/
VolantWidget.prototype.execute = function() {
  this.position = this.getAttribute("position", "fixed");
  this.stateTiddler = this.getAttribute("state", "");
  //this.makeChildWidgets();
};  
  
/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
VolantWidget.prototype.refresh = function(changedTiddlers) {
  var changedAttributes = this.computeAttributes(),
      hasChangedAttributes = $tw.utils.count(changedAttributes) > 0;
  if (hasChangedAttributes) {
      this.refreshSelf();
      return true;
  } else {
      return false;	
  }
  //return this.refreshChildren(changedTiddlers) || hasChangedAttributes;
};

exports.volant = VolantWidget;

})();