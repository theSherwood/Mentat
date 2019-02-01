/*\
created: 20190201185751112
type: application/javascript
title: $:/plugins/admls/mentat/globals/fakeName.js
tags: unfinished tampered
modified: 20190201213413832
module-type: global

Description...

ToDo:
- Fix stutter on mouseup and fast dragging
- fix zStack initialization
- make macro and widget for calling rather than storyview and utils (must add the event listener to the the tiddlers themselves)

\*/

(function() {

/*jslint node: true, browser: true */
/*global $tw: true */
"use strict";


const Weird = {
	zStack: [],
    pos1: 0,
    pos2: 0,
    pos3: 0,
    pos4: 0,

	startDrag: function(e) {
    	e.stopPropagation();
		// Disable dragging if interior elements were target
        if(!e.target.matches(".tc-tiddler-frame")) {
          return;
        }       
        const Weird = $tw.Weird;
        Weird.movingTiddler = this;

        // get the mouse cursor position at startup:
        Weird.pos3 = e.clientX;
        Weird.pos4 = e.clientY;
        // call a function whenever the cursor moves:
        window.addEventListener('mousemove', Weird.tiddlerDrag, false);
        window.addEventListener('mouseup', Weird.endDrag, false);        
    },
    
    tiddlerDrag: function(e) {
        const Weird = $tw.Weird;
        const tiddler = Weird.movingTiddler
        const title = tiddler.dataset.tiddlerTitle;
        e.preventDefault();
        // calculate the new cursor position:
        Weird.pos1 = Weird.pos3 - e.clientX;
        Weird.pos2 = Weird.pos4 - e.clientY;
        Weird.pos3 = e.clientX;
        Weird.pos4 = e.clientY;
        // get dimensions
        const top = tiddler.offsetTop;
        const left = tiddler.offsetLeft;
        
        // set the element's new position: prevent them from
        // running off the window (assumes fixed position)
        if (tiddler.style.position === "fixed") {
            if (tiddler.offsetTop - Weird.pos2 >= 0 && window.innerHeight >= tiddler.offsetTop - Weird.pos2 + tiddler.offsetHeight) {
                tiddler.style.top = (top - Weird.pos2) + "px";
            };
            if (tiddler.offsetLeft - Weird.pos1 >= 0 && window.innerWidth >= tiddler.offsetLeft - Weird.pos1 + tiddler.offsetWidth) {
                tiddler.style.left = (left - Weird.pos1) + "px";
            };
        
        } else {
        	tiddler.style.top = (top - Weird.pos2) + "px";
            tiddler.style.left = (left - Weird.pos1) + "px";
        }
    },

	endDrag: function() {
        const Weird = $tw.Weird;
        // stop moving when mouse button is released:
        Weird.logNewDimensions()
        window.removeEventListener('mousemove', Weird.tiddlerDrag, false);
        window.removeEventListener('mouseup', Weird.endDrag, false);
    },











    dragMouseDown: function(e) {
    	const Weird = $tw.Weird
        const elmnt = e.target;
        
        // Catch if the click happened on the tiddler or any element within it
        if (elmnt.matches('[data-tags*="testingStyle"], [data-tags*="testingStyle"] *')) {
            let traversingElmnt = elmnt;
            // If clicked element wasn't the tiddler element, get the tiddler element
            while (!traversingElmnt.matches('[data-tags*="testingStyle"]')) {
            	traversingElmnt = traversingElmnt.parentElement;
            }
			Weird.toZStack(traversingElmnt);
            e.stopPropagation();
        }
        
        // Catch resizing
        if (elmnt.classList.contains("resizer-left") || elmnt.classList.contains("resizer-right")) {
        	// They two resizers are inside of a span produced by the reveal widget
        	Weird.movingTiddler = elmnt.parentElement.parentElement;
            if (elmnt.classList.contains("resizer-left")) {
            	window.addEventListener('mousemove', Weird.resizeLeft, false);
            } else {
        		window.addEventListener('mousemove', Weird.resizeRight, false);
            }
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

    },

    elementDrag: function(e) {
        const Weird = $tw.Weird;
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
        };
        if (elmnt.offsetLeft - Weird.pos1 >= 0 && window.innerWidth >= elmnt.offsetLeft - Weird.pos1 + elmnt.offsetWidth) {
        	elmnt.style.left = (left - Weird.pos1) + "px";
        };
        } else {
        	elmnt.style.top = (top - Weird.pos2) + "px";
            elmnt.style.left = (left - Weird.pos1) + "px";
        }

    },

    closeDragElement: function() {
        const Weird = $tw.Weird;
        // stop moving when mouse button is released:
        Weird.logNewDimensions()
        window.removeEventListener('mousemove', Weird.elementDrag, false);
        window.removeEventListener('mouseup', Weird.closeDragElement, false);

    },
    
    logNewDimensions: function() {
    	const Weird = $tw.Weird;
    	const tiddler = Weird.movingTiddler;
    	const title = tiddler.dataset.tiddlerTitle;
        // Log the dimensions to the appropriate field for pickup by CSS
        const u = undefined;
        $tw.wiki.setText(title,'top',u,(tiddler.offsetTop)+"px",u);
        $tw.wiki.setText(title,'left',u,(tiddler.offsetLeft)+"px",u);
        $tw.wiki.setText(title,'width',u,(tiddler.offsetWidth)+"px",u);
        $tw.wiki.setText(title,'height',u,(tiddler.offsetHeight)+"px",u);
        // Wait to get rid of element styles until the fields have been updated
        setTimeout(function() {
        	tiddler.style.top = "";
        	tiddler.style.left = "";
            tiddler.style.width = "";
        	tiddler.style.height = "";
        }, 1000);
        Weird.movingTiddler = undefined;
    },
    
    resizeLeft: function(e) {
		const Weird = $tw.Weird;
    	const tiddler = Weird.movingTiddler;
        tiddler.style.width = (tiddler.offsetWidth + (tiddler.offsetLeft - e.clientX) + 5) + 'px';
        tiddler.style.left = (e.clientX - 5) + 'px';
       	tiddler.style.height = (e.clientY - tiddler.offsetTop + 5) + 'px';
    },
    
    resizeRight: function(e) {
    	const Weird = $tw.Weird;
    	const tiddler = Weird.movingTiddler;
       	tiddler.style.width = (e.clientX - tiddler.offsetLeft + 5) + 'px';
       	tiddler.style.height = (e.clientY - tiddler.offsetTop + 5) + 'px';      	
    },
    
    stopResize: function() {
    	const Weird = $tw.Weird;
    	Weird.logNewDimensions();

        window.removeEventListener('mousemove', Weird.resizeLeft, false);
        window.removeEventListener('mousemove', Weird.resizeRight, false);
        window.removeEventListener('mouseup', Weird.stopResize, false);
    },
    
    toZStack: function(elmnt) {
    	const Weird = $tw.Weird;
    	const zStack = Weird.zStack;
        const index = zStack.indexOf(elmnt);
        if (index !== -1) {
          zStack.splice(index, 1);
        }
        zStack.push(elmnt);
        // Assigns z-index to the elements in zstack based on position.
        for (let i = 0; i < zStack.length; i++) {
         	zStack[i].style.zIndex = i * 10 + 700;
            // Quick test to make sure this is working
            if (i === zStack.length - 1) {
            	zStack[i].style.border = "solid black 2px";
            } else {
            	zStack[i].style.border = "";
            }
        }
  	}
       
    
};

exports.Weird = Weird;

})();
