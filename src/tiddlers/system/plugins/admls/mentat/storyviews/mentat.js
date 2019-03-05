/*\
created: 20190129200505951
type: application/javascript
title: $:/plugins/admls/mentat/storyviews/mentat.js
tags: 
modified: 20190227183550720
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

	// Hide all tiddlers but those tagged $:/Window or Mentat
	$tw.utils.each(this.listWidget.children,function(itemWidget,index) {
		var domNode = itemWidget.findFirstDomNode();
		// Abandon if the list entry isn't a DOM element (it might be a text node)
		if(!(domNode instanceof Element)) {
			return;
		}

		const tiddlerTitle = itemWidget.parseTreeNode.itemTitle;
		const tiddler = $tw.wiki.getTiddler(tiddlerTitle);
		// If the tiddler is not tagged with Mentat or Window
		if(tiddler && (!tiddler.fields.tags || !(tiddler.fields.tags.includes("Mentat") || tiddler.fields.tags.includes("$:/Window")))) {
			domNode.style.display = "none";
		}
	});

};

MentatStoryView.prototype.navigateTo = function(historyInfo) {
	var listElementIndex = this.listWidget.findListItem(0,historyInfo.title);
	if(listElementIndex === undefined) {
		return;
	}
	var itemWidget = this.listWidget.children[listElementIndex],
		domNode = itemWidget.findFirstDomNode();
	// Abandon if the list entry isn't a DOM element (it might be a text node)
	if(!(domNode instanceof Element)) {
		return;
	}
	// Scroll the node into view
	this.listWidget.dispatchEvent({type: "tm-scroll", target: domNode});
	$tw.Volant.pushTiddlerToZStack(domNode);  
};

MentatStoryView.prototype.insert = function(widget) {
	var domNode = widget.findFirstDomNode(),
		duration = $tw.utils.getAnimationDuration();
	// Abandon if the list entry isn't a DOM element (it might be a text node)
	if(!(domNode instanceof Element)) {
		return;
	}

	const tiddlerTitle = widget.parseTreeNode.itemTitle;
	const tiddler = $tw.wiki.getTiddler(tiddlerTitle);
	if(!(tiddler && tiddler.fields.tags && (tiddler.fields.tags.includes("Mentat") || tiddler.fields.tags.includes("$:/Window")))) {
		domNode.style.display = "none";
		widget.removeChildDomNodes();

		const M = $tw.Mentat;

		const storyTiddler = $tw.wiki.getTiddler("$:/StoryList");
		let storyList = storyTiddler.fields.list;

		let windowTitles = $tw.wiki.getTiddlersWithTag("$:/Window");
		let windowTitle = M.getTopWindow(windowTitles, storyList);

		// Remove tiddler from $:/StoryList
		M.maintainStoryList();
		
		if(!windowTitle) {
			windowTitle = M.createWindow();
		}

		// Add the window to the $:/StoryList
		M.addToBaseStoryList(windowTitle, {}, true);

		// Add the tiddlerTitle to the window
		M.addToWindow({navigateTo:tiddlerTitle}, windowTitle);
	}
    
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