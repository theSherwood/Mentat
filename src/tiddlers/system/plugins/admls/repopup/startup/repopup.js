/*\
created: 20190304212312436
type: application/javascript
title: $:/plugins/admls/repopup/startup/repopup.js
tags: 
modified: 20190305150246584
module-type: startup

Repositions popups by augmenting the reveal widget's positionPopup method.
Does not affect the search bar for some reason.

\*/
(function() {
"use strict";

const revealWidget = require("$:/core/modules/widgets/reveal.js").reveal;

revealWidget.prototype.positionPopup = function(domNode) {
	domNode.style.position = "absolute";
	domNode.style.zIndex = "1000";
    
    if(this.popup) {
    // Set the popup position as usual
	switch(this.position) {
		case "left":
			domNode.style.left = Math.max(0, this.popup.left - domNode.offsetWidth) + "px";
			domNode.style.top = this.popup.top + "px";
			break;
		case "above":
			domNode.style.left = this.popup.left + "px";
			domNode.style.top = Math.max(0, this.popup.top - domNode.offsetHeight) + "px";
			break;
		case "aboveright":
			domNode.style.left = (this.popup.left + this.popup.width) + "px";
			domNode.style.top = Math.max(0, this.popup.top + this.popup.height - domNode.offsetHeight) + "px";
			break;
		case "right":
			domNode.style.left = (this.popup.left + this.popup.width) + "px";
			domNode.style.top = this.popup.top + "px";
			break;
		case "belowleft":
			domNode.style.left = Math.max(0, this.popup.left + this.popup.width - domNode.offsetWidth) + "px";
			domNode.style.top = (this.popup.top + this.popup.height) + "px";
			break;
		default: // Below
			domNode.style.left = this.popup.left + "px";
			domNode.style.top = (this.popup.top + this.popup.height) + "px";
			break;
	}
    }
    
   	/*
    Adjust the native popup position so that it fits in the viewport
    */
    
    const viewportHeight = document.documentElement.clientHeight;
    const viewportWidth = document.documentElement.clientWidth;
   	const nodePosition = domNode.getBoundingClientRect();
    let position = {
    left: nodePosition.left,
    right: nodePosition.right,
    width: nodePosition.width,
    top: nodePosition.top,
    bottom: nodePosition.bottom,
    height: nodePosition.height
    }
    
    function getTotalPosition(node) {
    	// Updates position with the most extreme of the children's positions
    	if(!node || node.hidden) {
        	return;
        }
    	const nodePosition = node.getBoundingClientRect();
        if(nodePosition.left < position.left) {
        	position.left = nodePosition.left;
        }
        if(nodePosition.top < position.top) {
        	position.top = nodePosition.top;
        }
        if(nodePosition.width > position.width) {
        	position.width = nodePosition.width;
        }
        if(nodePosition.height > position.height) {
        	position.height = nodePosition.height;
        }
        for (let childNode of node.children) {
        	getTotalPosition(childNode)
        }
    }
    
    // Get the footprint of domNode and all its descendants
   	getTotalPosition(domNode);
    
    position.right = position.left + position.width;
    position.bottom = position.top + position.height;
    
    // Shift away from overflowing the screen in height
    if(position.top < 10) { // At the top
    	position.top = 10;
        position.bottom += 10;
    }
    if(position.bottom > viewportHeight - 10) { // At the bottom
    	let newHeight = position.height;
    	if(position.height > viewportHeight - 20) {
        	newHeight = viewportHeight - 20;
        	domNode.style.height = newHeight + "px";
            // If the popup is too big, make it scrollable
            domNode.style.overflowY = "auto";
        }
        if(position.top + newHeight > viewportHeight - 10) {
        	const oldTop = Number(domNode.style.top.slice(0,-2));
            const differenceTop = position.top + newHeight - viewportHeight + 10;
            domNode.style.top = oldTop - differenceTop + "px";
        }
    }
    // Shift away from overflowing the screen in width 
    if(position.left < 10) { // At the left
    	position.left = 10;
        position.right += 10;
    }
  	if(position.right > viewportWidth - 10) { // At the right
    	let newWidth = position.width;
    	if(position.width > viewportWidth - 20) {
        	newWdith = viewportWidth - 20;
        	domNode.style.width = newWidth + "px";
            // If the popup is too big, make it scrollable
            domNode.style.overflowX = "auto";
        }
        if(position.left + newWidth > viewportWidth - 10) {
        	const oldLeft = Number(domNode.style.left.slice(0,-2));
            const differenceLeft = position.left + newWidth - viewportWidth + 10;
            domNode.style.left = oldLeft - differenceLeft + "px";
        }
    }   
};

})();