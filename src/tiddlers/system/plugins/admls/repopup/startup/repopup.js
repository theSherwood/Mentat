/*\
created: 20190304212312436
type: application/javascript
title: $:/plugins/admls/repopup/startup/repopup.js
tags: 
modified: 20190305150246584
module-type: startup

Repositions popups by augmenting the reveal widget's positionPopup method.
Does not affect the search bar for some reason.

\*/
(function () {
    "use strict";

    const revealWidget = require("$:/core/modules/widgets/reveal.js").reveal;

    revealWidget.prototype.positionPopup = function (domNode) {
        domNode.style.position = "absolute";
        domNode.style.zIndex = "1000";

        if (this.popup) {

            /* 
            These next few sections of code change the offsetParent of the domNode
            to be the nearest common ancestor of the domNode (the popup) and the 
            button that triggers it. We do this to avoid some problems related
            to tiddlers of a fixed size that have scrolling enabled.
            */

            // Find the button that triggered the popup
            const offsetParent = domNode.offsetParent;
            if (offsetParent) {
                let popupButton;
                offsetParent.querySelectorAll("button").forEach(button => {
                    if (button.offsetHeight === this.popup.height &&
                        button.offsetWidth === this.popup.width &&
                        button.offsetTop === this.popup.top &&
                        button.offsetLeft === this.popup.left) {
                        popupButton = button;
                    }
                });
                if (!popupButton) {
                    popupButton = domNode.previousElementSibling;
                }

                // Find the nearest common ancestor of the domNode and popupButton
                const domNodeAncestors = [];
                let domNodeAncestor = domNode.parentElement;
                while (domNodeAncestor !== offsetParent.parentElement) {
                    domNodeAncestors.push(domNodeAncestor);
                    domNodeAncestor = domNodeAncestor.parentElement;
                    if (!domNodeAncestor) {
                        break;
                    }
                }
                let buttonAncestor = popupButton;
                while (!domNodeAncestors.includes(buttonAncestor)) {
                    buttonAncestor = buttonAncestor.parentElement;
                    if (!buttonAncestor) {
                        break;
                    }
                }
                const nearestCommonAncestor = buttonAncestor;

                /* 
                Position the domNode relative to the nearestCommonAncestor (by setting ancestor
                position to "relative").
                */
                const ancestorPosition = getComputedStyle(nearestCommonAncestor).position;
                if (ancestorPosition !== "absolute" && ancestorPosition !== "fixed") {
                    nearestCommonAncestor.style.position = "relative";
                }

                /* 
                this.popup is the location of the popupButton relative to the original offsetParent.
                The new offsetParent is now the nearestCommonAncestor. So this.popup needs to be updated.
                */
                this.popup.left = popupButton.offsetLeft;
                this.popup.top = popupButton.offsetTop;
            }

            /* 
            This is unchanged from the native version of the revealWidget. Though we have
            changed the value of the this.popup.left and this.popup.top.
            */
            switch (this.position) {
                case "left":
                    domNode.style.left = Math.max(0, this.popup.left - domNode.offsetWidth) + "px";
                    domNode.style.top = this.popup.top + "px";
                    break;
                case "above":
                    domNode.style.left = this.popup.left + "px";
                    domNode.style.top = Math.max(0, this.popup.top - domNode.offsetHeight) + "px";
                    break;
                case "aboveright":
                    domNode.style.left = (this.popup.left + this.popup.width) + "px";
                    domNode.style.top = Math.max(0, this.popup.top + this.popup.height - domNode.offsetHeight) + "px";
                    break;
                case "right":
                    domNode.style.left = (this.popup.left + this.popup.width) + "px";
                    domNode.style.top = this.popup.top + "px";
                    break;
                case "belowleft":
                    domNode.style.left = Math.max(0, this.popup.left + this.popup.width - domNode.offsetWidth) + "px";
                    domNode.style.top = (this.popup.top + this.popup.height) + "px";
                    break;
                default: // Below
                    domNode.style.left = this.popup.left + "px";
                    domNode.style.top = (this.popup.top + this.popup.height) + "px";
                    break;
            }


            /*
            Adjust the native popup position so that it fits in the viewport
            */
            const viewportHeight = document.documentElement.clientHeight;
            const viewportWidth = document.documentElement.clientWidth;
            const nodePosition = domNode.getBoundingClientRect();
            let position = {
                left: nodePosition.left,
                right: nodePosition.right,
                width: nodePosition.width,
                top: nodePosition.top,
                bottom: nodePosition.bottom,
                height: nodePosition.height
            }

            function getTotalPosition(node) {
                // Updates position with the most extreme of the children's positions

                // Ignore node if hidden
                if (!node || node.hidden || getComputedStyle(node).display === "none") {
                    return;
                }
                const nodePosition = node.getBoundingClientRect();
                if (nodePosition.left < position.left) {
                    position.left = nodePosition.left;
                }
                if (nodePosition.top < position.top) {
                    position.top = nodePosition.top;
                }
                if (nodePosition.width > position.width) {
                    position.width = nodePosition.width;
                }
                if (nodePosition.height > position.height) {
                    position.height = nodePosition.height;
                }
                for (let childNode of node.children) {
                    getTotalPosition(childNode)
                }
            }

            // Get the footprint of domNode and all its descendants
            getTotalPosition(domNode);

            position.right = position.left + position.width;
            position.bottom = position.top + position.height;

            const buffer = 20; // Don't go directly to the edge of the screen

            // Shift away from overflowing the screen in height if necessary
            if (position.bottom > viewportHeight - buffer) {
                let newHeight = viewportHeight - buffer - position.top;
                domNode.style.height = newHeight + "px";
                domNode.style.cssText += "overflow: auto;";
            }
            // Shift away from overflowing the screen in width 
            if (position.left < buffer) { // At the left
                position.left = buffer;
                position.right += buffer;
            }
            if (position.right > viewportWidth - buffer) { // At the right
                let newWidth = position.width;
                if (position.width > viewportWidth - 2 * buffer) {
                    newWidth = viewportWidth - 2 * buffer;
                    domNode.style.width = newWidth + "px";
                }
                if (position.left + newWidth > viewportWidth - buffer) {
                    console.log(Number(domNode.style.left.slice(0, -2)));
                    console.log(position.left);
                    const oldLeft = Number(domNode.style.left.slice(0, -2));
                    const differenceLeft = position.left + newWidth - viewportWidth + buffer;
                    domNode.style.left = oldLeft - differenceLeft + "px";
                    domNode.style.cssText += "overflow: auto;";
                }
            }

            /*
            Now that we know where it should be positioned, make it "fixed"
            so that it clears any overflow restrictions on parent elements.
            This means that the popup won't scroll with the any scrollable
            containers. But it's worth it so that the popup doesn't get cut
            off.
            */
            const viewportOffset = domNode.getBoundingClientRect();
            domNode.style.position = "fixed";
            domNode.style.top = viewportOffset.top + "px";
            domNode.style.left = viewportOffset.left + "px";
        }
    };

})();