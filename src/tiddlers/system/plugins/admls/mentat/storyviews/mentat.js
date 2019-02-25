/*\
created: 20190129200505951
type: application/javascript
title: $:/plugins/admls/mentat/storyviews/mentat.js
tags: 
modified: 20190221170317269
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

	// Hide all tiddlers but those tagged Window or Mentat
	$tw.utils.each(this.listWidget.children,function(itemWidget,index) {
		var domNode = itemWidget.findFirstDomNode();
		// Abandon if the list entry isn't a DOM element (it might be a text node)
		if(!(domNode instanceof Element)) {
			return;
		}
		console.log("ITEM WIDGET", itemWidget);
		console.log("PARSE TREE NODE", itemWidget.parseTreeNode);
		console.log("ITEM TITLE", itemWidget.parseTreeNode.itemTitle);

		const tiddlerTitle = itemWidget.parseTreeNode.itemTitle;
		const tiddler = $tw.wiki.getTiddler(tiddlerTitle);
		if(tiddler && !(tiddler.fields.tags.includes("Mentat") || tiddler.fields.tags.includes("Window"))) {
			domNode.style.display = "none";
		}
		// if((targetTiddler && targetTiddler !== itemWidget.parseTreeNode.itemTitle) || (!targetTiddler && index)) {
		// 	domNode.style.display = "none";
		// } 
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
	console.log("WIDGET", widget);
	console.log("PARSE TREE NODE", widget.parseTreeNode);
	console.log("ITEM TITLE", widget.parseTreeNode.itemTitle);

	const tiddlerTitle = widget.parseTreeNode.itemTitle;
	const tiddler = $tw.wiki.getTiddler(tiddlerTitle);
	if(!(tiddler && tiddler.fields.tags && (tiddler.fields.tags.includes("Mentat") || tiddler.fields.tags.includes("Window")))) {
		domNode.style.display = "none";

		const baseStoryTiddler = $tw.wiki.getTiddler("$:/StoryList");
		const storyList = baseStoryTiddler.fields.list;

		let windowTitles = $tw.wiki.getTiddlersWithTag("Window");
		// Filter zStack by windowTitles
		const zStackTitles = $tw.Volant.zStack.map(tiddler => tiddler.dataset.tiddlerTitle);
		const windowsOnStack = zStackTitles.filter(windowTitle => windowTitles.includes(windowTitle));
		// Filter story list by windowTitles
		const windowsInStory = storyList.filter(windowTitle => windowTitles.includes(windowTitle));
		// Filter windowsOnStack by windowsInStory and get the one at the top of the stack
		const preferredWindow = windowsOnStack.filter(windowTitle => windowsInStory.includes(windowTitle)).slice(-1)[0];
		let windowTitle = preferredWindow || windowsInStory.slice(-1)[0] || windowsOnStack.slice(-1)[0] || windowTitles.slice(-1)[0];
		
		if(!windowTitle) {
			const timestamp = $tw.utils.formatDateString(new Date(), "YY0MM0DD0hh0mm0ss0XXX");
			windowTitle = "Window-" + timestamp;
			const windowTiddler = new $tw.Tiddler({
				title: windowTitle,
				tags: "Window",
				view: $tw.wiki.getTiddler("$:/plugins/admls/mentat/config/values").fields["default-window-storyview"] || "classic"
			});
			$tw.wiki.addTiddler(windowTiddler);
		}

		const riverPositions = {
			openLinkFromInsideRiver: $tw.wiki.getTiddler("$:/config/Navigation/openLinkFromInsideRiver").fields.text || "top",
			openLinkFromOutsideRiver: $tw.wiki.getTiddler("$:/config/Navigation/openLinkFromOutsideRiver").fields.text || "top"
		}

		// Add the window to the $:/StoryList
		$tw.wiki.addToStory(windowTitle, undefined, "$:/StoryList", riverPositions);
		$tw.wiki.addToHistory(windowTitle, undefined, "$:/HistoryList");

		// Add the tiddlerTitle to the window
		$tw.wiki.addToStory(tiddlerTitle, undefined, windowTitle, riverPositions);
		$tw.wiki.addToHistory(tiddlerTitle, undefined, windowTitle);

	}

	// Get the navigatorWidget for this story
	// let widget = this.listWidget;
	// while(!(widget.attributes["story"] && widget.attributes["history"])) {
	// 	widget = widget.parentWidget;
	// }
	// const navWidget = widget;
	// navWidget.


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