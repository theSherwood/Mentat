/*\
created: 20190201185751112
type: application/javascript
title: $:/plugins/admls/volant/globals/volant.js
tags: unfinished tampered
modified: 20190215102519620
module-type: global


Description...


\*/

(function() {

/*jslint node: true, browser: true */
/*global $tw: true */
"use strict";
    
$tw.hooks.addHook("th-deleting-tiddler", function(tiddler) {
    const tiddlerTitle = tiddler.hasField("draft.of") ? tiddler.getFieldString("draft.of") : tiddler.getFieldString("title");
    
    $tw.wiki.getTiddlersWithTag("permastate").forEach(function(configTiddlerTitle) {
    	const configTiddler = $tw.wiki.getTiddler(configTiddlerTitle);
        console.log("LOOKING AT CONFIGTIDDLER", configTiddlerTitle);
        if(configTiddler.getFieldString("configuredtiddler") === tiddlerTitle) {
        	console.log("WE HAVE A MATCH!", configTiddlerTitle);
        	//$tw.wiki.dispatchEvent({type: "tm-delete-tiddler", param: configTiddlerTitle, tiddlerTitle: undefined})
            $tw.hooks.invokeHook("th-deleting-tiddler",configTiddler);
			$tw.wiki.deleteTiddler(configTiddlerTitle);
        }
    });
    
    $tw.rootWidget.dispatchEvent({type: "tm-auto-save-wiki"});

});

const Volant = {
	zStack: [],
    pos1: 0,
    pos2: 0,
    pos3: 0,
    pos4: 0,

    tiddlerDrag: function(e) {
    	e.stopPropagation();
    	e.preventDefault();
        const Volant = $tw.Volant;
        const tiddler = Volant.eventTiddler
        const title = tiddler.dataset.tiddlerTitle;
        window.requestAnimationFrame(() => {
            // calculate the new cursor position:
            Volant.pos1 = Volant.pos3 - e.clientX;
            Volant.pos2 = Volant.pos4 - e.clientY;
            Volant.pos3 = e.clientX;
            Volant.pos4 = e.clientY;
            // get dimensions
            const top = tiddler.offsetTop;
            const left = tiddler.offsetLeft;
            // style tiddler element
            tiddler.style.top = (top - Volant.pos2) + "px";
            tiddler.style.left = (left - Volant.pos1) + "px";

            Volant.updateResizerPositions(tiddler);
        });
        
    },

	endDrag: function() {
        // stop moving when mouse button is released:
        const Volant = $tw.Volant;
        
        window.requestAnimationFrame(() => {
            Volant.snapToGrid();
            Volant.logNewDimensions()
       	});
            
        window.removeEventListener('mousemove', Volant.tiddlerDrag);
        window.removeEventListener('mouseup', Volant.endDrag, false);
    },

    logNewDimensions: function(tiddler, stateTiddlerTitle) {
    	if(tiddler === undefined) {
			tiddler = this.eventTiddler;
        }
        if(stateTiddlerTitle === undefined) {
        	stateTiddlerTitle = this.stateTiddlerTitle;
        }
        // Log the dimensions to the appropriate field for pickup by CSS
        $tw.wiki.setText(stateTiddlerTitle,'top',undefined,(tiddler.offsetTop)+"px",undefined);
        $tw.wiki.setText(stateTiddlerTitle,'left',undefined,(tiddler.offsetLeft)+"px",undefined);
        $tw.wiki.setText(stateTiddlerTitle,'width',undefined,(tiddler.offsetWidth)+"px",undefined);
        $tw.wiki.setText(stateTiddlerTitle,'height',undefined,(tiddler.offsetHeight)+"px",undefined);
        
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

	resizeLeft: function(e) {
    	e.preventDefault();
        e.stopPropagation();
    	const tiddler = $tw.Volant.eventTiddler;
        
        const viewportOffset = tiddler.getBoundingClientRect();
        
        window.requestAnimationFrame(() => {
            tiddler.style.height = (e.clientY - viewportOffset.top + 5) + 'px';
            if(tiddler.style.position === "fixed") {
                tiddler.style.width = (tiddler.offsetWidth + tiddler.offsetLeft - e.clientX + 5) + 'px';
                tiddler.style.left = (e.clientX - 5) + 'px'; 	
            } else {
                tiddler.style.left = (window.scrollX + e.clientX - 5) + 'px';
                tiddler.style.width = (tiddler.offsetWidth + viewportOffset.left - e.clientX + 5) + 'px';
            }

            $tw.Volant.updateResizerPositions(tiddler);
        });
    },

    resizeRight: function(e) {
    	e.preventDefault();
        e.stopPropagation();
        const tiddler = $tw.Volant.eventTiddler;

        const viewportOffset = tiddler.getBoundingClientRect();
        
        window.requestAnimationFrame(() => {
            tiddler.style.width = (e.clientX - viewportOffset.left + 5) + 'px';
            tiddler.style.height = (e.clientY - viewportOffset.top + 5) + 'px';

            $tw.Volant.updateResizerPositions(tiddler);
        });
    },
    
    endResize: function() {
    	const Volant = $tw.Volant;

        window.requestAnimationFrame(() => {
            Volant.snapToGrid();
            Volant.logNewDimensions()
       	});
        
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
            window.requestAnimationFrame(() => {
            	$tw.Volant.updateResizerPositions(tiddler);
            });
        });
    },
    
    snapToGrid: function(tiddler) {
    	const Volant = $tw.Volant;
       	if(tiddler === undefined) {
        	tiddler = Volant.eventTiddler;
        }
        Volant.getGrid();
        
        // refactor this
        const gridgap = Number($tw.wiki.getTiddler("$:/plugins/admls/volant/config/values").fields.gridgap) || 0;

        const positionIsFixed = (tiddler.style.position === "fixed");
        tiddler.style.top = (Volant.convertToGridValue(tiddler.offsetTop, positionIsFixed, "height") + gridgap) + "px";
        tiddler.style.left = (Volant.convertToGridValue(tiddler.offsetLeft, positionIsFixed, "width") + gridgap) + "px";
        tiddler.style.height = (Volant.convertToGridValue(tiddler.offsetHeight, positionIsFixed, "height") - (2*gridgap)) + "px";
        tiddler.style.width = (Volant.convertToGridValue(tiddler.offsetWidth, positionIsFixed, "width") - (2*gridgap)) + "px";
        Volant.updateResizerPositions(tiddler); 
    },
    
    getGrid: function() {
    	const gridsize = Number($tw.wiki.getTiddler("$:/plugins/admls/volant/config/values").fields.gridsize) || 1;
    	const width = document.documentElement.clientWidth;
        const height = document.documentElement.clientHeight;
        $tw.Volant.grid = {
        	// The grid should register to the viewport for fixed volant tiddlers, but not for absolute
            "fixedCellWidth": width/Math.round(width/gridsize),
            "fixedCellHeight": height/Math.round(height/gridsize),
            "absoluteGridSize": gridsize
        }
    },
    
    convertToGridValue(number, positionIsFixed, direction) {
    	const grid = $tw.Volant.grid;
        if(positionIsFixed) {
            if(direction === "width") {
                const quotient = number / grid.fixedCellWidth;
                return Math.round(Math.round(quotient) * grid.fixedCellWidth);
            } else {
                const quotient = number / grid.fixedCellHeight;
                return Math.round(Math.round(quotient) * grid.fixedCellHeight);
            }
        } else {
        	const quotient = number / grid.absoluteGridSize;
            return Math.round(Math.round(quotient) * grid.absoluteGridSize);
        }
    }
    	

};    


exports.Volant = Volant;

})();
