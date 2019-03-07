/*\
created: 20190129200505951
type: application/javascript
title: $:/plugins/admls/mentat/storyviews/mentat.js
tags: 
modified: 20190306230040860
module-type: storyview

Views the story as a collection of story windows

\*/
(function () {

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	var MentatStoryView = function (listWidget) {
		// Hide all tiddlers but those with the permitted tags

		this.listWidget = listWidget;
		$tw.utils.each(this.listWidget.children, function (itemWidget, index) {
			var domNode = itemWidget.findFirstDomNode();
			// Abandon if the list entry isn't a DOM element (it might be a text node)
			if (!(domNode instanceof Element)) {
				return;
			}

			const tiddlerTitle = itemWidget.parseTreeNode.itemTitle;
			const tiddler = $tw.wiki.getTiddler(tiddlerTitle);

			const M = $tw.Mentat;
			M.updateAllowedTags();

			// Check to see if tiddler has allowed tags
			for (let tag of M.allowedTags) {
				if (tiddler && tiddler.fields.tags && tiddler.fields.tags.includes(tag)) {
					return;
				}
			}

			if (tiddler) {
				domNode.style.display = "none";
			}



		});

	};

	MentatStoryView.prototype.navigateTo = function (historyInfo) {
		var listElementIndex = this.listWidget.findListItem(0, historyInfo.title);
		if (listElementIndex === undefined) {
			return;
		}
		var itemWidget = this.listWidget.children[listElementIndex],
			domNode = itemWidget.findFirstDomNode();
		// Abandon if the list entry isn't a DOM element (it might be a text node)
		if (!(domNode instanceof Element)) {
			return;
		}
		// Scroll the node into view
		this.listWidget.dispatchEvent({ type: "tm-scroll", target: domNode });
		$tw.Volant.pushTiddlerToZStack(domNode);
	};

	MentatStoryView.prototype.insert = function (widget) {
		var domNode = widget.findFirstDomNode();
		// Abandon if the list entry isn't a DOM element (it might be a text node)
		if (!(domNode instanceof Element)) {
			return;
		}

		const tiddlerTitle = widget.parseTreeNode.itemTitle;
		const tiddler = $tw.wiki.getTiddler(tiddlerTitle);

		const M = $tw.Mentat;
		M.updateAllowedTags();

		// Check to see if tiddler has allowed tags
		for (let tag of M.allowedTags) {
			if (tiddler && tiddler.fields.tags && tiddler.fields.tags.includes(tag)) {
				return;
			}
		}

		domNode.style.display = "none";
		widget.removeChildDomNodes();

		const storyTiddler = $tw.wiki.getTiddler("$:/StoryList");
		let storyList = storyTiddler.fields.list;

		let windowTitles = $tw.wiki.getTiddlersWithTag("$:/Window");
		let windowTitle = M.getTopWindow(windowTitles, storyList);

		// Remove tiddler from $:/StoryList
		M.maintainStoryList();

		if (!windowTitle) {
			windowTitle = M.createWindow();
		}

		// Add the window to the $:/StoryList
		M.addToBaseStoryList(windowTitle, {}, true);

		// Add the tiddlerTitle to the window
		M.addToWindow({ navigateTo: tiddlerTitle }, windowTitle);
	};

	MentatStoryView.prototype.remove = function (widget) {
		widget.removeChildDomNodes();
	};

	exports.mentat = MentatStoryView;

})();