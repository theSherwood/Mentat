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

    /* 
    Position the domNode relative to the parentElement.
    This can help avoid weird scrolling stuff.
    */
    const parent = domNode.parentElement;
    const parentPosition = getComputedStyle(parent).position;
    if (parentPosition !== "absolute" && parentPosition !== "fixed") {
        parent.style.position = "relative";
    }

    /* 
    The previousElementSibling is presumably the button that triggers the popup.
    this.popup is the location of this element. It needs updated because we are
    now making everything relative to the parentElement.
    */
    const sibling = domNode.previousElementSibling;
    this.popup.left = sibling.offsetLeft;
    this.popup.top = sibling.offsetTop;

    /* 
    This is unchanged from the native version of the revealWidget. Though we have
    changed the value of the this.popup.left and this.popup.top.
    */
    if(this.popup) {
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
        
        // Ignore node if hidden
    	if(!node || node.hidden || getComputedStyle(node).display === "none") {
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

    const buffer = 20;

    // Shift away from overflowing the screen in height if necessary
    if(position.bottom > viewportHeight - buffer) {
        let newHeight = viewportHeight - buffer - position.top;
        domNode.style.height = newHeight + "px";
        domNode.style.cssText += "overflow: auto;";
    }
    // Shift away from overflowing the screen in width 
    if(position.left < buffer) { // At the left
    	position.left = buffer;
        position.right += buffer;
    }

    // Rewrite?
  	if(position.right > viewportWidth - buffer) { // At the right
    	let newWidth = position.width;
    	if(position.width > viewportWidth - 2 * buffer) {
            newWidth = viewportWidth - 2 * buffer;
        	domNode.style.width = newWidth + "px";
        }
        if(position.left + newWidth > viewportWidth - buffer) {
            console.log(Number(domNode.style.left.slice(0,-2)));
            console.log(position.left);
        	const oldLeft = Number(domNode.style.left.slice(0,-2));
            const differenceLeft = position.left + newWidth - viewportWidth + buffer;
            domNode.style.left = oldLeft - differenceLeft + "px";
            domNode.style.cssText += "overflow: auto;";
        }
    }  

    /*
    Now that we know where it should be positioned, make it "fixed"
    so that it clears any overflow restrictions on parent elements.
    */
    const viewportOffset = domNode.getBoundingClientRect();
    domNode.style.position = "fixed";
    domNode.style.top = viewportOffset.top + "px";
    domNode.style.left = viewportOffset.left + "px";
};

})();