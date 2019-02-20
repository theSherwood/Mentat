/*\
created: 20190129200505951
type: application/javascript
title: $:/plugins/admls/mentat/storyviews/mentat.js
tags: 
modified: 20190220164555583
module-type: storyview

Views the story as a collection of story-windows

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";        

var easing = "cubic-bezier(0.645, 0.045, 0.355, 1)";

var MentatStoryView = function(listWidget) {
	this.listWidget = listWidget;
};

MentatStoryView.prototype.navigateTo = function(historyInfo) {
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
	$tw.Volant.pushTiddlerToZStack(targetElement);  
};

MentatStoryView.prototype.insert = function(widget) {
	var targetElement = widget.findFirstDomNode(),
		duration = $tw.utils.getAnimationDuration();
	// Abandon if the list entry isn't a DOM element (it might be a text node)
	if(!(targetElement instanceof Element)) {
		return;
	}
	console.log('THIS', this);
	console.log('TARGETELEMENT', targetElement);

	// let widget = this.listWidget;
	// while(!(widget.attributes["story"] && widget.attributes["history"])) {
	// 	widget = widget.parentWidget;
	// }
	// const navigatorWidget = widget;


	/*\
    if(targetElement.dataset && !targetElement.matches(".tc-tagged-Window")) {
    	// find window tiddler nearest top of zStack
        const zStack = $tw.Volant.zStack;
        console.log(this);
        const topWindow = zStack.filter(tiddler => tiddler.matches(".tc-tagged-Window")).slice(-1)[0];
        console.log('TOPWINDOW',topWindow);
        if(topWindow) {
        	const title = targetElement.dataset.tiddlerTitle;
            const storyTitle = topWindow.dataset.tiddlerTitle;
			$tw.wiki.addToStory(title,undefined,storyTitle,{openLinkFromInsideRiver: "top",openLinkFromOutsideRiver: "top"});
			
			// Get encapsulating story list
            let widget = this.listWidget;
            while(widget.variables["tv-story-list"].value === storyTitle) {
				widget = widget.parentWidget;
			}
            const outerStoryTitle = widget.variables["tv-story-list"].value;
            const outerStoryTiddler = $tw.wiki.getTiddler(outerStoryTitle);
            let storyList = outerStoryTiddler.fields.list;
            
            // Remove inserted tiddler from outer storyList
            const p = storyList.indexOf(title);
            while(p !== -1) {
                storyList.splice(p,1);
                p = storyList.indexOf(title);
            }
            // Save outerStoryTiddler
            $tw.wiki.addTiddler(new $tw.Tiddler(
                {title: outerStoryTitle},
                outerStoryTiddler,
				{list: storyList})
			);

        } else {
         //TBD
        }
    } else if (targetElement.dataset && targetElement.matches(".tc-tagged-Window")) {
    	$tw.Volant.pushTiddlerToZStack(targetElement); 
	}
	\*/
    
};

MentatStoryView.prototype.remove = function(widget) {
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
    

};

exports.mentat = MentatStoryView;

})();