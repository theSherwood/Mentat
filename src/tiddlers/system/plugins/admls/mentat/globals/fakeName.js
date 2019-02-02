/*\
created: 20190201185751112
type: application/javascript
title: $:/plugins/admls/mentat/globals/fakeName.js
tags: unfinished tampered
modified: 20190202002503634
module-type: global

Description...

ToDo:
- Fix stutter on mouseup and fast dragging
- fix zStack initialization
- remove items from zStack when they are closed
- handle switching from view to edit and back
- edit doesn't work with zStack for some reason
- edit doesn't run macro. So a movingtiddler that is opened in edit mode first may not get any of the eventhandlers attached. I'm not sure.
- I may have introduced problem with getEventTiddler and the way it affects the zStack with window-tiddlers


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
        Weird.eventTiddler = this;

        // get the mouse cursor position at startup:
        Weird.pos3 = e.clientX;
        Weird.pos4 = e.clientY;
        // call a function whenever the cursor moves:
        window.addEventListener('mousemove', Weird.tiddlerDrag, false);
        window.addEventListener('mouseup', Weird.endDrag, false);        
    },
    
    tiddlerDrag: function(e) {
        const Weird = $tw.Weird;
        const tiddler = Weird.eventTiddler
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

    logNewDimensions: function() {
    	const tiddler = this.eventTiddler;
    	const title = tiddler.dataset.tiddlerTitle;
        // Log the dimensions to the appropriate field for pickup by CSS
        $tw.wiki.setText(title,'top',undefined,(tiddler.offsetTop)+"px",undefined);
        $tw.wiki.setText(title,'left',undefined,(tiddler.offsetLeft)+"px",undefined);
        $tw.wiki.setText(title,'width',undefined,(tiddler.offsetWidth)+"px",undefined);
        $tw.wiki.setText(title,'height',undefined,(tiddler.offsetHeight)+"px",undefined);
        $tw.wiki.setText(title,'bottom',undefined,(tiddler.offsetTop+tiddler.offsetHeight)+"px",undefined);
        $tw.wiki.setText(title,'right',undefined,(tiddler.offsetLeft+tiddler.offsetWidth)+"px",undefined);
        // Wait to get rid of element styles until the fields have been updated
        setTimeout(function() {
        	tiddler.style.top = "";
        	tiddler.style.left = "";
            tiddler.style.width = "";
        	tiddler.style.height = "";
        }, 1000);
        this.eventTiddler = undefined;
    },

    pushZStack: function(e) {
    	const Weird = $tw.Weird;
    	const tiddler = Weird.getEventTiddler(e);
        if(!tiddler) {
        	return;
        };
        e.stopPropagation();
    	const zStack = Weird.zStack;
        const index = zStack.indexOf(tiddler);
        if (index !== -1) {
          zStack.splice(index, 1);
        }
        zStack.push(tiddler);
        Weird.evaluateZStack(tiddler);
  	},
    
   	evaluateZStack: function(tiddler) {
    	const zStack = $tw.Weird.zStack;
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
  	},
    
    startResize: function(e) {
    	if (e.target.classList.contains("resizer")) {
            const Weird = $tw.Weird;
            Weird.eventTiddler = Weird.getEventTiddler(e);
            console.log(Weird.eventTiddler);
            e.stopPropagation();
            if (e.target.classList.contains("resizer-left")) {
                window.addEventListener('mousemove', Weird.resizeLeft, false);
            } else if (e.target.classList.contains("resizer-right")) {
                window.addEventListener('mousemove', Weird.resizeRight, false);     
            }
            window.addEventListener('mouseup', Weird.endResize, false); 
        }
    },

	resizeLeft: function(e) {
    	const tiddler = $tw.Weird.eventTiddler;
        tiddler.style.width = (tiddler.offsetWidth + (tiddler.offsetLeft - e.clientX) + 5) + 'px';
        tiddler.style.left = (e.clientX - 5) + 'px';
       	tiddler.style.height = (e.clientY - tiddler.offsetTop + 5) + 'px';
    },
    
    resizeRight: function(e) {
        const tiddler = $tw.Weird.eventTiddler;
       	tiddler.style.width = (e.clientX - tiddler.offsetLeft + 5) + 'px';
       	tiddler.style.height = (e.clientY - tiddler.offsetTop + 5) + 'px';      	
    },
    
    endResize: function() {
    	const Weird = $tw.Weird;
    	Weird.logNewDimensions();
        window.removeEventListener('mousemove', Weird.resizeLeft, false);
        window.removeEventListener('mousemove', Weird.resizeRight, false);
        window.removeEventListener('mouseup', Weird.endResize, false);
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
        return elmnt;
    }

};    


exports.Weird = Weird;

})();
