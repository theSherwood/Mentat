/*\
created: 20190129100912717
type: application/javascript
title: empty widget test
tags: 
modified: 20190129170333511
module-type: widget

actions triggered on pan gestures + event coordinates

\*/
(function (global) {

"use strict";
/*jslint node: true, browser: true */
/*global $tw: false */

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var EmptyWidget = function(parseTreeNode,options) {
    this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
EmptyWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
EmptyWidget.prototype.render = function(parent,nextSibling) {
    var self = this;
    var parentDomNode = parent;

    // Compute attributes and execute state
    this.computeAttributes();
    this.execute();
    this.renderChildren(parent,nextSibling);
};
/*
Compute the internal state of the widget
*/
EmptyWidget.prototype.execute = function() {
    this.makeChildWidgets();
    console.log(this);
    /*
    this.domNode = this.children[0].parentDomNode;
    console.log(this.domNode.dataset.tiddlerTitle);
    */
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
EmptyWidget.prototype.refresh = function(changedTiddlers) {
    var self = this;
    var changedAttributes = this.computeAttributes();
    if(Object.keys(changedAttributes).length) {
        self.refreshSelf();
        return true;
    }
    return this.refreshChildren(changedTiddlers);
};

exports.empty = EmptyWidget;
})();