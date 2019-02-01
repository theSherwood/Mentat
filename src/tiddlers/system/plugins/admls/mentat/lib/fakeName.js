/*\
created: 20190130010029762
type: application/javascript
title: $:/plugins/admls/mentat/lib/fakeName.js
tags: unfinished tampered
modified: 20190201003616726
module-type: library

Description...

ToDo:
- Fix stutter on mouseup
- Add resize handle functionality
- zStack

\*/

(function() {

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";


const Weird = {
	zStack: [],
    pos1: 0,
    pos2: 0,
    pos3: 0,
    pos4: 0,

    dragMouseDown: function(e) {
    	const Weird = window.Weird
        const elmnt = e.target;
        console.log("CLICK");
        // Catch resizing
        if (elmnt.classList.contains("resizer-left") || elmnt.classList.contains("resizer-right")) {
        	console.log("RESIZE ME NOW, CAP'N");
        	// They two resizers are inside of a span produced by the reveal widget
        	Weird.movingTiddler = elmnt.parentElement.parentElement;
        	window.addEventListener('mousemove', Weird.resize, false);
     		window.addEventListener('mouseup', Weird.stopResize, false);
            return;
        }
        // The dragging won't occur if the click is on some other element than the tagged tiddler, either within or without.
        if (!(elmnt.dataset.tags && elmnt.dataset.tags.includes("testingStyle"))) {
          return;
        }
        Weird.movingTiddler = elmnt
        // get the mouse cursor position at startup:
        Weird.pos3 = e.clientX;
        Weird.pos4 = e.clientY;
        // call a function whenever the cursor moves:
        window.addEventListener('mousemove', Weird.elementDrag, false);
        window.addEventListener('mouseup', Weird.closeDragElement, false);

        console.log("dragMouseDown", elmnt);
    },

    elementDrag: function(e) {
        const Weird = window.Weird;
        e = e || window.event;
        const elmnt = Weird.movingTiddler
        const title = elmnt.dataset.tiddlerTitle;
        e.preventDefault();
        // calculate the new cursor position:
        Weird.pos1 = Weird.pos3 - e.clientX;
        Weird.pos2 = Weird.pos4 - e.clientY;
        Weird.pos3 = e.clientX;
        Weird.pos4 = e.clientY;
        // get dimensions
        const top = elmnt.offsetTop;
        const left = elmnt.offsetLeft;
        // set the element's new position: prevent them from
        // running off the window (assumes fixed position)
        if (elmnt.style.position === "fixed") {
        if (elmnt.offsetTop - Weird.pos2 >= 0 && window.innerHeight >= elmnt.offsetTop - Weird.pos2 + elmnt.offsetHeight) {
        	elmnt.style.top = (top - Weird.pos2) + "px";
            //$tw.wiki.setText(title,'top',undefined,(top - Weird.pos2),undefined);
        };
        if (elmnt.offsetLeft - Weird.pos1 >= 0 && window.innerWidth >= elmnt.offsetLeft - Weird.pos1 + elmnt.offsetWidth) {
        	elmnt.style.left = (left - Weird.pos1) + "px";
            //$tw.wiki.setText(title,'left',undefined,(left - Weird.pos1),undefined);
        };
        } else {
        	elmnt.style.top = (top - Weird.pos2) + "px";
            elmnt.style.left = (left - Weird.pos1) + "px";
            //$tw.wiki.setText(title,'top',undefined,(top - Weird.pos2),undefined);
            //$tw.wiki.setText(title,'left',undefined,(left - Weird.pos1),undefined);
        }

        console.log("elementDrag", elmnt);
    },

    closeDragElement: function() {
        const Weird = window.Weird;
        // stop moving when mouse button is released:
        Weird.logNewDimensions()
        Weird.movingTiddler = undefined;
        window.removeEventListener('mousemove', Weird.elementDrag, false);
        window.removeEventListener('mouseup', Weird.closeDragElement, false);

        console.log("closeDragElement");
    },
    
    logNewDimensions: function() {
    	const elmnt = Weird.movingTiddler;
    	const title = elmnt.dataset.tiddlerTitle;
        // Log the dimensions to the appropriate field for pickup by CSS
        $tw.wiki.setText(title,'top',undefined,(elmnt.offsetTop)+"px",undefined);
        $tw.wiki.setText(title,'left',undefined,(elmnt.offsetLeft)+"px",undefined);
        $tw.wiki.setText(title,'width',undefined,(elmnt.offsetWidth)+"px",undefined);
        $tw.wiki.setText(title,'height',undefined,(elmnt.offsetHeight)+"px",undefined);
        // Wait to get rid of element styles until the fields have been updated
        setTimeout(function() {
        	elmnt.style.top = null;
        	elmnt.style.left = null;
            elmnt.style.width = null;
        	elmnt.style.height = null;
        }, 1000);    
    },
    
    resize: function(e) {
    	console.log('resize is HERE');
    	const tiddler = Weird.movingTiddler;
        const resizer = e.target;
      	if (resizer.classList.contains("resizer-left")) {
        	tiddler.style.left = (e.clientX) + 'px';
        	tiddler.style.top = (e.clientY) + 'px';
        	tiddler.style.width = (e.clientX - tiddler.offsetLeft + 5) + 'px';
       		tiddler.style.height = (e.clientY - tiddler.offsetTop + 5) + 'px';
        } else if (resizer.classList.contains("resizer-right")) {
       		tiddler.style.width = (e.clientX - tiddler.offsetLeft + 5) + 'px';
       		tiddler.style.height = (e.clientY - tiddler.offsetTop + 5) + 'px';
        }
       	
    },
    
    stopResize: function(e) {
    	console.log('stopResize is HERE');
    	Weird.logNewDimensions();
    	Weird.movingTiddler = undefined;
        window.removeEventListener('mousemove', Weird.resize, false);
        window.removeEventListener('mouseup', Weird.stopResize, false);
    }
    
    
};

exports.Weird = Weird;

})();




 /*\ 
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
\*/


