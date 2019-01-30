/*\
created: 20190129200505951
type: application/javascript
title: $:/plugins/admls/mentat/storyviews/mentat.js
tags: 
modified: 20190130005524076
module-type: storyview

type: application/javascript
title: '$:/plugins/admls/mentat/storyviews/mentat.js'
module-type: storyview

Views the story as a collection of story-windows

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

$tw.utils.addEventListeners(window, [
    	{name: "click", handlerFunction: function(e) {
        if(e.target.dataset.tags==="testingStyle"){
        console.log(e);
        }
        }
        }]);

var easing = "cubic-bezier(0.645, 0.045, 0.355, 1)";

var ClassicStoryView = function(listWidget) {
	this.listWidget = listWidget;
};

ClassicStoryView.prototype.navigateTo = function(historyInfo) {
	var listElementIndex = this.listWidget.findListItem(0,historyInfo.title);
	if(listElementIndex === undefined) {
		return;
	}
	var listItemWidget = this.listWidget.children[listElementIndex],
		targetElement = listItemWidget.findFirstDomNode();
	// Abandon if the list entry isn't a DOM element (it might be a text node)
	if(!(targetElement instanceof Element)) {
		return;
	}
	// Scroll the node into view
	this.listWidget.dispatchEvent({type: "tm-scroll", target: targetElement});
    
    console.log('This is a test navigation!');
};

ClassicStoryView.prototype.insert = function(widget) {
	var targetElement = widget.findFirstDomNode(),
		duration = $tw.utils.getAnimationDuration();
	// Abandon if the list entry isn't a DOM element (it might be a text node)
	if(!(targetElement instanceof Element)) {
		return;
	}
    
    
    
    
    
    
    const elmnt = targetElement;
    /*\
    if(!$tw.utils.hasClass(elmnt,"Window")) {
    	return;
    }
    
    const zstack = []; // For assigning z-indices.
	
    
	$tw.utils.addEventListeners(elmnt, [
    	{name: "click", handlerFunction: function() {
        console.log("It's working");
        }
        }]);
	\*/

/*\
	const dimensions = $tw.utils.getBoundingPageRect

document.querySelectorAll(".mydiv").forEach(elmnt => {
  // log the dimension info to the .content div
  function logDimensions() {
    const content = elmnt.querySelector(".content");
    content.querySelector(".top").innerHTML = elmnt.style.top.slice(0, -2) || elmnt.offsetTop;
    content.querySelector(".left").innerHTML = elmnt.style.left.slice(0, -2)|| elmnt.offsetLeft;
    content.querySelector(".height").innerHTML = elmnt.style.height.slice(0, -2) || elmnt.offsetHeight;
    content.querySelector(".width").innerHTML = elmnt.style.width.slice(0, -2) || elmnt.offsetWidth;
  }
  
  function queryLog(elmnt, styleAttribute) {
    const content = elmnt.querySelector(".content");
    return content.querySelector(`.${styleAttribute}`).innerHTML;
  }
  
  function getSize() {
    elmnt.style.width = queryLog(elmnt, "width") + 'px';
    elmnt.style.height = queryLog(elmnt, "height") + 'px';
  }
  
  function getPosition() {
    elmnt.style.top = queryLog(elmnt, "top") + 'px';
    elmnt.style.left = queryLog(elmnt, "left") + 'px';
  }
  
  logDimensions();
  getSize();
  getPosition();
  elmnt.addEventListener("mousedown", dragMouseDown, false);
  elmnt.addEventListener("mousedown", zPosition, false);
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  function remove(array, element) {
    const index = array.indexOf(element);
    if (index !== -1) {
      array.splice(index, 1);
    }
  }
  
  function zPosition(e) {
    // Removes element from stack and then adds it to the end.
    remove(zstack, elmnt);
    zstack.push(elmnt);
    // Assigns z-index to the elements in zstack based on position.
    for (let i = 0; i < zstack.length; i++) {
      zstack[i].style.zIndex = i * 10;
    }
  }
  
  function dragMouseDown(e) {
    // The dragging won't occur if the click is on some other element within mydiv.
    if (!e.target.className.includes("mydiv")) {
      return;
    }
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    // call a function whenever the cursor moves:
    window.addEventListener('mousemove', elementDrag, false);
    window.addEventListener('mouseup', closeDragElement, false);
  }
    
  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position: prevent them from
    // running of the window (assumes fixed)
    if (elmnt.style.position = "fixed") {
    if (elmnt.offsetTop - pos2 >= 0 && window.innerHeight >= elmnt.offsetTop - pos2 + elmnt.offsetHeight) {
      const top = queryLog(elmnt, "top");
      elmnt.style.top = (top - pos2) + "px";
    };
    if (elmnt.offsetLeft - pos1 >= 0 && window.innerWidth >= elmnt.offsetLeft - pos1 + elmnt.offsetWidth) {
      const left = queryLog(elmnt, "left");
      elmnt.style.left = (left - pos1) + "px";
    };
    } else {
      const top = queryLog(elmnt, "top");
      const left = queryLog(elmnt, "left");
      elmnt.style.top = (top - pos2) + "px";
      elmnt.style.left = (left - pos1) + "px";
    }
    logDimensions();
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    window.removeEventListener('mousemove', elementDrag, false);
    window.removeEventListener('mouseup', closeDragElement, false);
  }
  
  const resizer = elmnt.querySelector(".resizer");
  resizer.addEventListener('mousedown', initResize, false);

  function initResize(e) {
     window.addEventListener('mousemove', Resize, false);
     window.addEventListener('mouseup', stopResize, false);
  }
  function Resize(e) {
    getSize();
     elmnt.style.width = (e.clientX - elmnt.offsetLeft) + 'px';
     elmnt.style.height = (e.clientY - elmnt.offsetTop) + 'px';
     logDimensions();
  }
  function stopResize(e) {
    window.removeEventListener('mousemove', Resize, false);
    window.removeEventListener('mouseup', stopResize, false);
  }

  });
\*/

    
    
    
    
	// Get the current height of the tiddler
	var computedStyle = window.getComputedStyle(targetElement),
		currMarginBottom = parseInt(computedStyle.marginBottom,10),
		currMarginTop = parseInt(computedStyle.marginTop,10),
		currHeight = targetElement.offsetHeight + currMarginTop;
	// Reset the margin once the transition is over
	setTimeout(function() {
		$tw.utils.setStyle(targetElement,[
			{transition: "none"},
			{marginBottom: ""}
		]);
	},duration);
	// Set up the initial position of the element
	$tw.utils.setStyle(targetElement,[
		{transition: "none"},
		{marginBottom: (-currHeight) + "px"},
		{opacity: "0.0"}
	]);
	$tw.utils.forceLayout(targetElement);
	// Transition to the final position
	$tw.utils.setStyle(targetElement,[
		{transition: "opacity " + duration + "ms " + easing + ", " +
					"margin-bottom " + duration + "ms " + easing},
		{marginBottom: currMarginBottom + "px"},
		{opacity: "1.0"}
	]);
    
    console.log('This is a test insert!');
};

ClassicStoryView.prototype.remove = function(widget) {
	var targetElement = widget.findFirstDomNode(),
		duration = $tw.utils.getAnimationDuration(),
		removeElement = function() {
			widget.removeChildDomNodes();
		};
	// Abandon if the list entry isn't a DOM element (it might be a text node)
	if(!(targetElement instanceof Element)) {
		removeElement();
		return;
	}
	// Get the current height of the tiddler
	var currWidth = targetElement.offsetWidth,
		computedStyle = window.getComputedStyle(targetElement),
		currMarginBottom = parseInt(computedStyle.marginBottom,10),
		currMarginTop = parseInt(computedStyle.marginTop,10),
		currHeight = targetElement.offsetHeight + currMarginTop;
	// Remove the dom nodes of the widget at the end of the transition
	setTimeout(removeElement,duration);
	// Animate the closure
	$tw.utils.setStyle(targetElement,[
		{transition: "none"},
		{transform: "translateX(0px)"},
		{marginBottom:  currMarginBottom + "px"},
		{opacity: "1.0"}
	]);
	$tw.utils.forceLayout(targetElement);
	$tw.utils.setStyle(targetElement,[
		{transition: $tw.utils.roundTripPropertyName("transform") + " " + duration + "ms " + easing + ", " +
					"opacity " + duration + "ms " + easing + ", " +
					"margin-bottom " + duration + "ms " + easing},
		{transform: "translateX(-" + currWidth + "px)"},
		{marginBottom: (-currHeight) + "px"},
		{opacity: "0.0"}
	]);
    
    console.log('This is a test remove!');
};

exports.mentat = ClassicStoryView;

})();