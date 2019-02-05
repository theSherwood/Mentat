/*\
created: 20190201185751112
type: application/javascript
title: $:/plugins/admls/volant/globals/volant.js
tags: unfinished tampered
modified: 20190205000440915
module-type: global

Description...

ToDo:
- Fix stutter on mouseup and fast dragging
- remove items from zStack when they are closed (this might have to be done in the storyview)
- I may have introduced problem with getEventTiddler and the way it affects the zStack with window-tiddlers
- store zStack in a click history tiddler
- add absolute flying tiddlers
- change namespace
- something other than a border for the top tiddler of the zstack
- refactor
- comment code
- implement grid


\*/

(function() {

/*jslint node: true, browser: true */
/*global $tw: true */
"use strict";


const Volant = {
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
        const Volant = $tw.Volant;
        Volant.eventTiddler = this;

        // get the mouse cursor position at startup:
        Volant.pos3 = e.clientX;
        Volant.pos4 = e.clientY;
        // call a function whenever the cursor moves:
        window.addEventListener('mousemove', Volant.tiddlerDrag);
        window.addEventListener('mouseup', Volant.endDrag, false);        
    },
    
    tiddlerDrag: function(e) {
        const Volant = $tw.Volant;
        const tiddler = Volant.eventTiddler
        const title = tiddler.dataset.tiddlerTitle;
        e.preventDefault();
        // calculate the new cursor position:
        Volant.pos1 = Volant.pos3 - e.clientX;
        Volant.pos2 = Volant.pos4 - e.clientY;
        Volant.pos3 = e.clientX;
        Volant.pos4 = e.clientY;
        // get dimensions
        const top = tiddler.offsetTop;
        const left = tiddler.offsetLeft;
        
        tiddler.style.top = (top - Volant.pos2) + "px";
        tiddler.style.left = (left - Volant.pos1) + "px";

        Volant.updateResizerPositions(tiddler);
    },

	endDrag: function() {
        const Volant = $tw.Volant;
        // stop moving when mouse button is released:
        Volant.logNewDimensions()
        window.removeEventListener('mousemove', Volant.tiddlerDrag);
        window.removeEventListener('mouseup', Volant.endDrag, false);
    },

    logNewDimensions: function(tiddler) {
    	if(tiddler === undefined) {
			tiddler = this.eventTiddler;
        }
    	const title = tiddler.dataset.tiddlerTitle;
        // Log the dimensions to the appropriate field for pickup by CSS
        $tw.wiki.setText(title,'top',undefined,(tiddler.offsetTop)+"px",undefined);
        $tw.wiki.setText(title,'left',undefined,(tiddler.offsetLeft)+"px",undefined);
        $tw.wiki.setText(title,'width',undefined,(tiddler.offsetWidth)+"px",undefined);
        $tw.wiki.setText(title,'height',undefined,(tiddler.offsetHeight)+"px",undefined);
        
        // Log resizer positions
        const resizerLeft = tiddler.querySelector(".resizer-left");
        const resizerRight = tiddler.querySelector(".resizer-right");
        if(resizerLeft.style.position === "fixed") {
            $tw.wiki.setText(title,'resizerleft-top',undefined,(tiddler.offsetTop+tiddler.offsetHeight-resizerLeft.offsetHeight)+"px",undefined);
            $tw.wiki.setText(title,'resizerleft-left',undefined,(tiddler.offsetLeft)+"px",undefined);        
            $tw.wiki.setText(title,'resizerright-top',undefined,(tiddler.offsetTop+tiddler.offsetHeight-resizerRight.offsetHeight)+"px",undefined);
            $tw.wiki.setText(title,'resizerright-left',undefined,(tiddler.offsetLeft+tiddler.offsetWidth-resizerRight.offsetWidth)+"px",undefined);
        } else {
        	$tw.wiki.setText(title,'resizerleft-top',undefined,(tiddler.clientHeight + tiddler.scrollTop - resizerLeft.offsetHeight)+"px",undefined);
            $tw.wiki.setText(title,'resizerleft-left',undefined,(tiddler.scrollLeft)+"px",undefined);        
            $tw.wiki.setText(title,'resizerright-top',undefined,(tiddler.clientHeight + tiddler.scrollTop - resizerRight.offsetHeight)+"px",undefined);
            $tw.wiki.setText(title,'resizerright-left',undefined,(tiddler.clientWidth + tiddler.scrollLeft - resizerRight.offsetWidth)+"px",undefined);
        }
        
        this.eventTiddler = undefined;
    },

    pushTiddlerToZStack: function(tiddler) {
    	const Volant = $tw.Volant;
        if(!tiddler) {
        	return;
        };
    	const zStack = Volant.zStack;
        const index = zStack.indexOf(tiddler);
        if (index !== -1) {
          zStack.splice(index, 1);
        }
        zStack.push(tiddler);
        Volant.evaluateZStack();
  	},
    
    pushEventToZStack(e) {
    	const tiddler = $tw.Volant.getEventTiddler(e);
        $tw.Volant.pushTiddlerToZStack(tiddler);
    },
    
   	evaluateZStack: function() {
    	const zStack = $tw.Volant.zStack;
        // Assigns z-index to the elements in zstack based on position.
        for (let i = 0; i < zStack.length; i++) {
         	zStack[i].style.zIndex = i * 10 + 700;
            // Quick test to make sure this is working
            if (i === zStack.length - 1) {
            	zStack[i].style.border = "solid black 2px"; // Signalling selected thing by border is far from ideal
            } else {
            	zStack[i].style.border = "";
            }
        }
  	},
    
    startResize: function(e) {
    	if (e.target.classList.contains("resizer")) {
            const Volant = $tw.Volant;
            Volant.eventTiddler = Volant.getEventTiddler(e);
            console.log(Volant.eventTiddler);
            e.stopPropagation();
            if (e.target.classList.contains("resizer-left")) {
                window.addEventListener('mousemove', Volant.resizeLeft);
            } else if (e.target.classList.contains("resizer-right")) {
                window.addEventListener('mousemove', Volant.resizeRight);     
            }
            window.addEventListener('mouseup', Volant.endResize, false); 
        }
    },

	resizeLeft: function(e) {
    	e.preventDefault();
    	const tiddler = $tw.Volant.eventTiddler;
        //const resizerLeft = tiddler.querySelector(".resizer-left");
        //const resizerRight = tiddler.querySelector(".resizer-right");
        const viewportOffset = tiddler.getBoundingClientRect();
        tiddler.style.width = (tiddler.offsetWidth + (viewportOffset.left - e.clientX) + 5) + 'px';
        tiddler.style.left = (e.clientX - 5) + 'px';
       	tiddler.style.height = (e.clientY - viewportOffset.top + 5) + 'px';
        
        $tw.Volant.updateResizerPositions(tiddler);
    },
    
    resizeRight: function(e) {
    	e.preventDefault();
        const tiddler = $tw.Volant.eventTiddler;
        //const resizerLeft = tiddler.querySelector(".resizer-left");
        //const resizerRight = tiddler.querySelector(".resizer-right");
        const viewportOffset = tiddler.getBoundingClientRect();
       	tiddler.style.width = (e.clientX - viewportOffset.left + 5) + 'px';
       	tiddler.style.height = (e.clientY - viewportOffset.top + 5) + 'px';
        
        $tw.Volant.updateResizerPositions(tiddler);
        
    },
    
    endResize: function() {
    	const Volant = $tw.Volant;
    	Volant.logNewDimensions();
        window.removeEventListener('mousemove', Volant.resizeLeft);
        window.removeEventListener('mousemove', Volant.resizeRight);
        window.removeEventListener('mouseup', Volant.endResize, false);
    },
    
    getEventTiddler: function(e) {
    	let elmnt = e.target;
        // Get the tiddler that the event happened in
    	while(!(elmnt.matches('[data-tiddler-title]'))) {
        	// Stop if you get to the root element
        	if(elmnt.tagName === "HTML") {
            	return;
            }
            elmnt = elmnt.parentElement;
        }
        e.stopPropagation();
        const tiddler = elmnt;
        return tiddler;
    },
    
    updateResizerPositions: function(tiddler) {
    	const resizerLeft = tiddler.querySelector(".resizer-left");
        const resizerRight = tiddler.querySelector(".resizer-right");
        
        if(resizerLeft.style.position === "fixed") {
            resizerLeft.style.top = (tiddler.offsetTop + tiddler.offsetHeight - resizerLeft.offsetHeight) + "px";
            resizerLeft.style.left = (tiddler.offsetLeft) + "px";
            resizerRight.style.top = (tiddler.offsetTop + tiddler.offsetHeight - resizerRight.offsetHeight) + "px";
            resizerRight.style.left = (tiddler.offsetLeft + tiddler.offsetWidth - resizerRight.offsetWidth) + "px";
        } else {     
        	resizerLeft.style.top = (tiddler.clientHeight + tiddler.scrollTop - resizerLeft.offsetHeight) + "px";
            resizerLeft.style.left = (tiddler.scrollLeft) + "px";
            resizerRight.style.top = (tiddler.clientHeight + tiddler.scrollTop - resizerRight.offsetHeight) + "px";
            resizerRight.style.left = (tiddler.clientWidth + tiddler.scrollLeft - resizerRight.offsetWidth) + "px";
        }
    },
    
    repositionAbsoluteResizers: function(e) {
    	const tiddler = $tw.Volant.getEventTiddler(e);
        e.stopPropagation();
        $tw.Volant.updateResizerPositions(tiddler);
    }
    	

};    


exports.Volant = Volant;

})();
