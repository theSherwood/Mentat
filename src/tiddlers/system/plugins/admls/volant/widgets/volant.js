/*\
created: 20190212164359746
type: application/javascript
title: $:/plugins/admls/volant/widgets/volant.js
tags: 
modified: 20190213185531734
width: 494px
top: 188px
module-type: widget
left: 198px
height: 282px

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

	const position = this.position;
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

	let stateTiddlerTitle = tiddler.dataset.tiddlerTitle;
    if($tw.wiki.getTiddler(stateTiddlerTitle).hasField("draft.of")) {
    	stateTiddlerTitle = $tw.wiki.getTiddler(stateTiddlerTitle).getFieldString("draft.of");
    }
	if(!(this.separateState === "no")) {
    	stateTiddlerTitle = "$:/plugins/admls/volant/state/" + stateTiddlerTitle;
    }
    	   
    const startDrag = function(e) {
        // Disable dragging if interior elements were target
        const dragModeIsOn = $tw.wiki.getTiddler("$:/plugins/admls/volant/config/values").fields.dragmode === "on";
        const targetIsChildElement = !e.target.matches(".tc-tiddler-frame"); // This will be problematic if you have nested volant tiddlers
        const targetIsResizer = e.target.matches(".resizer"); // Stops drag if target is a resizer
        if(targetIsResizer || (!dragModeIsOn && targetIsChildElement)) {
            return;
        }
        e.stopPropagation();
        e.preventDefault();
        const Volant = $tw.Volant;
        Volant.eventTiddler = tiddler;
        Volant.stateTiddlerTitle = stateTiddlerTitle;

        // get the mouse cursor position at startup:
        Volant.pos3 = e.clientX;
        Volant.pos4 = e.clientY;
        // call a function whenever the cursor moves:
        window.addEventListener('mousemove', Volant.tiddlerDrag);
        window.addEventListener('mouseup', Volant.endDrag, false);        
    };
    
    const startResize = function(e) {
        if (!e.target.classList.contains("resizer")) {
        	return;
        }
        e.preventDefault();
        e.stopPropagation();

        const Volant = $tw.Volant;
        Volant.eventTiddler = tiddler;
        Volant.stateTiddlerTitle = stateTiddlerTitle;

        if (e.target.classList.contains("resizer-left")) {
        	window.addEventListener('mousemove', Volant.resizeLeft);
        } else if (e.target.classList.contains("resizer-right")) {
        	window.addEventListener('mousemove', Volant.resizeRight);     
        }
        window.addEventListener('mouseup', Volant.endResize, false); 
    };   
    
    tiddler.addEventListener("mousedown", startDrag);
    tiddler.addEventListener("mousedown", $tw.Volant.pushEventToZStack, false);
    tiddler.addEventListener("mousedown", startResize);
    if(this.position === "absolute") {
    	window.addEventListener("scroll", $tw.Volant.repositionResizersOnAbsolute, false);
    }
        
    $tw.Volant.snapToGrid(tiddler);
    $tw.Volant.logNewDimensions(tiddler, stateTiddlerTitle);
    $tw.Volant.pushTiddlerToZStack(tiddler); 	
};


/*
Compute the internal state of this widget.
*/
VolantWidget.prototype.execute = function() {
  this.position = this.getAttribute("position", "fixed");
  this.separateState = this.getAttribute("separateState", "no");
  //this.makeChildWidgets();
};  
  
/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
VolantWidget.prototype.refresh = function(changedTiddlers) {
  var changedAttributes = this.computeAttributes();
  if (changedAttributes.position || changedAttributes.state) {
      this.refreshSelf();
      return true;
  } else {
      return false;	
  }
  //return this.refreshChildren(changedTiddlers) || hasChangedAttributes;
};

exports.volant = VolantWidget;

})();