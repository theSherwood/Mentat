/*\
created: 20190212164359746
type: application/javascript
title: $:/plugins/admls/volant/widgets/volant.js
tags: 
modified: 20190216195312429
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
	console.log(this);
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

	this.getConfigTiddler(tiddler.dataset.tiddlerTitle);
    const configTiddlerTitle = this.configTiddlerTitle;
    
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
        Volant.configTiddlerTitle = configTiddlerTitle;

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
        Volant.configTiddlerTitle = configTiddlerTitle;

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
    $tw.Volant.logNewDimensions(tiddler, configTiddlerTitle);
    $tw.Volant.pushTiddlerToZStack(tiddler); 	
};

VolantWidget.prototype.getConfigTiddler = function(title) {
	let tiddlerTitle = title;
	this.configTiddlerTitle = tiddlerTitle;
	if(!(this.separateConfig === "no")) {
    	if($tw.wiki.getTiddler(tiddlerTitle).hasField("draft.of")) {
    		tiddlerTitle = $tw.wiki.getTiddler(tiddlerTitle).getFieldString("draft.of");
    	}
        
    	const configTiddlerTitle = this.configTiddlerPrefix + tiddlerTitle;
        this.configTiddlerTitle = configTiddlerTitle;
        
        $tw.wiki.setText(configTiddlerTitle,"list",undefined,"[[" + tiddlerTitle + "]]",undefined);
        
        const configTiddler = $tw.wiki.getTiddler(configTiddlerTitle);
		const modification = $tw.wiki.getModificationFields();
        const tag = $tw.Volant.configTiddlerTag;
		if(configTiddler) {
            modification.tags = (configTiddler.fields.tags || []).slice(0);
            $tw.utils.pushTop(modification.tags,tag);
            $tw.wiki.addTiddler(new $tw.Tiddler(configTiddler,modification));			
		} else {
        	const tags = [];
			tags.push(tag);
			$tw.wiki.addTiddler(new $tw.Tiddler({title: configTiddlerTitle, tags: tags},modification));
        }
    }    
};

/*
Compute the internal state of this widget.
*/
VolantWidget.prototype.execute = function() {
  this.position = this.getAttribute("position", "fixed");
  this.separateConfig = this.getAttribute("separateConfig", "no");
  this.configTiddlerPrefix = this.getAttribute("configTiddlerPrefix", "$:/config/Volant/");
  //this.makeChildWidgets();
};  
  
/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
VolantWidget.prototype.refresh = function(changedTiddlers) {
  var changedAttributes = this.computeAttributes();
  if (changedAttributes.position || changedAttributes.separateConfig || changedAttributes.configTiddlerPrefix) {
      this.refreshSelf();
      return true;
  } else {
      return false;	
  }
};

exports.volant = VolantWidget;

})();