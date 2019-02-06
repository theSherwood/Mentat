/*\
created: 20190201185751112
type: application/javascript
title: $:/plugins/admls/volant/globals/volant.js
tags: unfinished tampered
modified: 20190206011156233
module-type: global

Description...

ToDo:

- I may have introduced problem with getEventTiddler and the way it affects the zStack with window-tiddlers
- store zStack in a click history tiddler
- refactor
- comment code
- fix bug on absolute tiddlers far to right or left of story river on resize


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
    	e.preventDefault();
        const Volant = $tw.Volant;
        const tiddler = Volant.eventTiddler
        const title = tiddler.dataset.tiddlerTitle;
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
        
        Volant.snapToGrid();
        
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
    	const Volant = $tw.Volant;
        // Filter out tiddlers no longer in the storyList
        const storyList = $tw.wiki.getTiddler("$:/StoryList").fields.list;
        Volant.zStack = Volant.zStack.filter(tiddler => storyList.includes(tiddler.dataset.tiddlerTitle));
        // Assigns z-index to the elements in zstack based on position.
        const zStack = Volant.zStack;
        for (let i = 0; i < zStack.length; i++) {
         	zStack[i].style.zIndex = i * 10 + 700;
            // Quick test to make sure this is working
            if (i === zStack.length - 1) {
            	zStack[i].style.boxShadow = "2px 2px 13px 6px rgba(0,0,0,.4)";
            } else {
            	zStack[i].style.boxShadow = "";
            }
        }
  	},
    
    startResize: function(e) {
    	if (e.target.classList.contains("resizer")) {
        	e.preventDefault();
            e.stopPropagation();
            
            const Volant = $tw.Volant;
            Volant.eventTiddler = Volant.getEventTiddler(e);
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
        e.stopPropagation();
    	const tiddler = $tw.Volant.eventTiddler;
        
        const viewportOffset = tiddler.getBoundingClientRect();
        tiddler.style.left = (window.scrollX + e.clientX - 5) + 'px';
        tiddler.style.width = (tiddler.offsetWidth + (viewportOffset.left - e.clientX) + 5) + 'px';
       	tiddler.style.height = (e.clientY - viewportOffset.top + 5) + 'px';
        
        $tw.Volant.updateResizerPositions(tiddler);
    },

    resizeRight: function(e) {
    	e.preventDefault();
        e.stopPropagation();
        const tiddler = $tw.Volant.eventTiddler;

        const viewportOffset = tiddler.getBoundingClientRect();
       	tiddler.style.width = (e.clientX - viewportOffset.left + 5) + 'px';
       	tiddler.style.height = (e.clientY - viewportOffset.top + 5) + 'px';
        
        $tw.Volant.updateResizerPositions(tiddler);
        
    },
    
    endResize: function() {
    	const Volant = $tw.Volant;
        
        Volant.snapToGrid();
        
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
        const viewportOffset = tiddler.getBoundingClientRect();
        
        resizerLeft.style.top = (viewportOffset.top + tiddler.offsetHeight - resizerLeft.offsetHeight) + "px";
        resizerLeft.style.left = (viewportOffset.left) + "px";
        resizerRight.style.top = (viewportOffset.top + tiddler.offsetHeight - resizerRight.offsetHeight) + "px";
        resizerRight.style.left = (viewportOffset.left + tiddler.offsetWidth - resizerRight.offsetWidth) + "px";

    },
    
    repositionResizersOnAbsolute: function() {
        document.querySelectorAll(".resizer-left.absolute").forEach(function(resizer) {
        	let elmnt = resizer;
            while(!(elmnt.matches('[data-tiddler-title]'))) {
                // Stop if you get to the root element
                if(elmnt.tagName === "HTML") {
                    return;
                }
                elmnt = elmnt.parentElement;
            }
            const tiddler = elmnt;
            $tw.Volant.updateResizerPositions(tiddler);
        });
    },
    
    snapToGrid: function(tiddler) {
    	const Volant = $tw.Volant;
       	if(tiddler === undefined) {
        	tiddler = Volant.eventTiddler;
        }
        const grid = Volant.getGrid();
        tiddler.style.top = Volant.convertToGridValue(tiddler.offsetTop, grid, "height") + "px";
        tiddler.style.left = Volant.convertToGridValue(tiddler.offsetLeft, grid, "width") + "px";
        tiddler.style.height = Volant.convertToGridValue(tiddler.offsetHeight, grid, "height") + "px";
        tiddler.style.width = Volant.convertToGridValue(tiddler.offsetWidth, grid, "width") + "px";
        Volant.updateResizerPositions(tiddler); 	   
    },
    
    getGrid: function() {
    	const width = document.documentElement.clientWidth;
        const height = document.documentElement.clientHeight;
        return {
          "cellWidth": width/Math.round(width/10),
          "cellHeight": height/Math.round(height/10)
        }
    },
    
    convertToGridValue(number, grid, direction) {
    	if(direction === "width") {
            const quotient = number / grid.cellWidth;
            return Math.round(Math.round(quotient) * grid.cellWidth);
       	} else {
        	const quotient = number / grid.cellHeight;
            return Math.round(Math.round(quotient) * grid.cellHeight);
        }
    }
    	

};    


exports.Volant = Volant;

})();
