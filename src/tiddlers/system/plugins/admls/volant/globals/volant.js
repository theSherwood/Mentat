/*\
created: 20190201185751112
type: application/javascript
title: $:/plugins/admls/volant/globals/volant.js
tags: unfinished tampered
modified: 20190221170445591
module-type: global

Methods and eventListeners for tiddlers that can be repositioned and resized with ease.
Adds a few hooks, too.

\*/

(function () {
    /*jslint node: true, browser: true */
    /*global $tw: false */
    "use strict";

    const Volant = {
        zStack: [], // click and navigation history
        pos1: 0,
        pos2: 0,
        pos3: 0,
        pos4: 0,
        configTiddlerTag: "$:/config/Volant",

        tiddlerDrag: function (e) {
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

        endDrag: function () {
            // stop moving when mouse button is released:
            const Volant = $tw.Volant;

            window.requestAnimationFrame(() => {
                Volant.snapToGrid();
                Volant.logNewDimensions();
            });

            window.removeEventListener('mousemove', Volant.tiddlerDrag);
            window.removeEventListener('mouseup', Volant.endDrag, false);
        },

        logNewDimensions: function (tiddler, configTiddlerTitle) {
            // Logs the position of a tiddler to fields in its configuration tiddler
            if (tiddler === undefined) {
                tiddler = this.eventTiddler;
            }
            if (configTiddlerTitle === undefined) {
                configTiddlerTitle = this.configTiddlerTitle;
            }
            // Log the dimensions to the appropriate field for pickup by CSS
            if (tiddler.style.position === "absolute") {
                $tw.wiki.setText(configTiddlerTitle, 'top', undefined, (tiddler.offsetTop) + "px", undefined);
                $tw.wiki.setText(configTiddlerTitle, 'left', undefined, (tiddler.offsetLeft) + "px", undefined);
                $tw.wiki.setText(configTiddlerTitle, 'width', undefined, (tiddler.offsetWidth) + "px", undefined);
                $tw.wiki.setText(configTiddlerTitle, 'height', undefined, (tiddler.offsetHeight) + "px", undefined);
            } else {
                $tw.wiki.setText(configTiddlerTitle, 'top', undefined, tiddler.style.top, undefined);
                $tw.wiki.setText(configTiddlerTitle, 'left', undefined, tiddler.style.left, undefined);
                $tw.wiki.setText(configTiddlerTitle, 'width', undefined, tiddler.style.width, undefined);
                $tw.wiki.setText(configTiddlerTitle, 'height', undefined, tiddler.style.height, undefined);
            }

            // Remove the styling from the tiddler once the css has caught up
            setTimeout(function () {
                window.requestAnimationFrame(() => {
                    $tw.Volant.removeStyle(tiddler);
                });
            }, 500);
            this.eventTiddler = undefined;
            this.configTiddlerTitle = undefined;
        },

        removeStyle: function (tiddler) {
            // Removes position styling from the tiddler so css can take effect
            tiddler.style.top = "";
            tiddler.style.left = "";
            tiddler.style.height = "";
            tiddler.style.width = "";
        },

        pushTiddlerToZStack: function (tiddler) {
            // Adds tiddler to click and navigation history stored as $tw.Volant.zStack
            const Volant = $tw.Volant;
            if (!tiddler) {
                return;
            };
            const zStack = Volant.zStack;
            let index = zStack.indexOf(tiddler);
            while (index !== -1) {
                zStack.splice(index, 1);
                index = zStack.indexOf(tiddler);
            }
            zStack.push(tiddler);
            Volant.evaluateZStack();
        },

        evaluateZStack: function () {
            // Logs zStack to a tiddler and handles overlapping (by adjusting z-index values)
            const Volant = $tw.Volant;

            const zStack = Volant.zStack;
            // Log zStack to the list of $:/state/zStack
            const zList = zStack.map(tiddler => tiddler.dataset.tiddlerTitle).slice(-20);
            const zStackTiddler = $tw.wiki.getTiddler("$:/state/zStack");
            $tw.wiki.addTiddler(new $tw.Tiddler(
                { title: "$:/state/zStack" },
                zStackTiddler,
                { list: zList }
            ));
            // Assigns z-index to the elements in zstack based on position
            for (let i = 0; i < zStack.length; i++) {
                zStack[i].style.zIndex = i * 2 + 700;
            }
        },

        resizeLeft: function (e) {
            // Resize the tiddler by the left resizer
            e.preventDefault();
            e.stopPropagation();
            const tiddler = $tw.Volant.eventTiddler;

            const viewportOffset = tiddler.getBoundingClientRect();

            window.requestAnimationFrame(() => {
                tiddler.style.height = (e.clientY - viewportOffset.top + 5) + 'px';
                if (tiddler.style.position === "fixed") {
                    tiddler.style.width = (tiddler.offsetWidth + tiddler.offsetLeft - e.clientX + 5) + 'px';
                    tiddler.style.left = (e.clientX - 5) + 'px';
                } else {
                    tiddler.style.left = (window.scrollX + e.clientX - 5) + 'px';
                    tiddler.style.width = (tiddler.offsetWidth + viewportOffset.left - e.clientX + 5) + 'px';
                }

                $tw.Volant.updateResizerPositions(tiddler);
            });
        },

        resizeRight: function (e) {
            // Resize the tiddler by the right resizer
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

        endResize: function () {
            const Volant = $tw.Volant;

            window.requestAnimationFrame(() => {
                Volant.snapToGrid();
                Volant.logNewDimensions()
            });

            window.removeEventListener('mousemove', Volant.resizeLeft);
            window.removeEventListener('mousemove', Volant.resizeRight);
            window.removeEventListener('mouseup', Volant.endResize, false);
        },

        getEventTiddler: function (e) {
            let elmnt = e.target;
            // Get the volant tiddler that the event happened in
            while (!(elmnt.matches('.volant'))) {
                // Stop if you get to the root element
                if (elmnt.tagName === "HTML") {
                    return;
                }
                elmnt = elmnt.parentElement;
            }
            e.stopPropagation();
            const tiddler = elmnt;
            return tiddler;
        },

        updateResizerPositions: function (tiddler) {
            const resizerLeft = tiddler.querySelector(".resizer-left");
            const resizerRight = tiddler.querySelector(".resizer-right");
            const viewportOffset = tiddler.getBoundingClientRect();

            if (tiddler.style.position === "absolute") {
                resizerLeft.style.top = (viewportOffset.top + tiddler.offsetHeight - resizerLeft.offsetHeight) + "px";
                resizerLeft.style.left = (viewportOffset.left) + "px";
                resizerRight.style.top = (viewportOffset.top + tiddler.offsetHeight - resizerRight.offsetHeight) + "px";
                resizerRight.style.left = (viewportOffset.left + tiddler.offsetWidth - resizerRight.offsetWidth) + "px";
            } else {
                resizerLeft.style.cssText += `left:${viewportOffset.left}px;`;
                resizerLeft.style.cssText += `top:calc(${viewportOffset.top}px + ${viewportOffset.height}px - ${resizerLeft.offsetHeight}px);`;
                resizerRight.style.cssText += `left:calc(${viewportOffset.left}px + ${viewportOffset.width}px - ${resizerRight.offsetWidth}px);`;
                resizerRight.style.cssText += `top:calc(${viewportOffset.top}px + ${viewportOffset.height}px - ${resizerRight.offsetHeight}px);`;
            }

        },

        repositionResizers: function () {
            document.querySelectorAll(".resizer-left").forEach(function (resizer) {
                let elmnt = resizer;
                while (!(elmnt.matches('.volant'))) {
                    // Stop if you get to the root element
                    if (elmnt.tagName === "HTML") {
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

        snapToGrid: function (tiddler) {
            // Take the tiddler position and snap it to an implicit grid ($tw.Volant.grid)
            const Volant = $tw.Volant;
            if (tiddler === undefined) {
                tiddler = Volant.eventTiddler;
            }
            Volant.getGrid();

            const positionIsFixed = (tiddler.style.position === "fixed");
            let gridgap;
            if (positionIsFixed) {
                gridgap = Number($tw.wiki.getTiddler("$:/plugins/admls/volant/config/values").fields.defaultgridgap) || 0;

                const top = Volant.convertToGridValue(tiddler.offsetTop - gridgap, positionIsFixed, "height");
                const left = Volant.convertToGridValue(tiddler.offsetLeft - gridgap, positionIsFixed, "width");
                const height = Volant.convertToGridValue(tiddler.offsetHeight + 2 * gridgap, positionIsFixed, "height");
                const width = Volant.convertToGridValue(tiddler.offsetWidth + 2 * gridgap, positionIsFixed, "width");

                tiddler.style.cssText += `top:calc(${top}% + ${gridgap}px);`;
                tiddler.style.cssText += `left:calc(${left}% + ${gridgap}px);`;
                tiddler.style.cssText += `height:calc(${height}% - 2 * ${gridgap}px);`;
                tiddler.style.cssText += `width:calc(${width}% - 2 * ${gridgap}px);`;
            } else {
                gridgap = Number($tw.wiki.getTiddler("$:/plugins/admls/volant/config/values").fields.absolutegridgap) || 0;

                tiddler.style.top = (Volant.convertToGridValue(tiddler.offsetTop, positionIsFixed, "height") + gridgap) + "px";
                tiddler.style.left = (Volant.convertToGridValue(tiddler.offsetLeft, positionIsFixed, "width") + gridgap) + "px";
                tiddler.style.height = (Volant.convertToGridValue(tiddler.offsetHeight, positionIsFixed, "height") - (2 * gridgap)) + "px";
                tiddler.style.width = (Volant.convertToGridValue(tiddler.offsetWidth, positionIsFixed, "width") - (2 * gridgap)) + "px";
            }

            Volant.updateResizerPositions(tiddler);
        },

        getGrid: function () {
            // Get size of grid cells
            $tw.Volant.grid = {
                viewportWidth: document.documentElement.clientWidth, // excludes scrollbars
                viewportHeight: document.documentElement.clientHeight,
                // Different grids for fixed (default) and absolute tiddlers
                defaultGridSize: Number($tw.wiki.getTiddler("$:/plugins/admls/volant/config/values").fields.defaultgridsize) || 1,
                absoluteGridSize: Number($tw.wiki.getTiddler("$:/plugins/admls/volant/config/values").fields.absolutegridsize) || 1
            }
        },

        convertToGridValue(number, positionIsFixed, direction) {
            // Convert a positional value to a value that lays on the implicit grid
            const grid = $tw.Volant.grid;
            // Fixed and absolute used different grid schemes
            if (positionIsFixed) { // fixed grid uses a percentage of the viewport
                const viewportValue = (direction === "width") ? grid.viewportWidth : grid.viewportHeight;
                let percentage = (number / viewportValue) * 100;
                return Math.round(percentage / grid.defaultGridSize) * grid.defaultGridSize;
            } else { // absolute grid is a number of pixels
                const quotient = number / grid.absoluteGridSize;
                return Math.round(Math.round(quotient) * grid.absoluteGridSize);
            }
        }
    };

    exports.Volant = Volant;

    $tw.hooks.addHook("th-deleting-tiddler", function (tiddler) {
        // If a volant tiddler is to be deleted, delete its configuration tiddler also
        const tiddlerTitle = tiddler.hasField("draft.of") ? tiddler.getFieldString("draft.of") : tiddler.getFieldString("title");

        $tw.wiki.getTiddlersWithTag($tw.Volant.configTiddlerTag).forEach(configTiddlerTitle => {
            const configTiddler = $tw.wiki.getTiddler(configTiddlerTitle);
            if (configTiddler.getFieldString("list") === tiddlerTitle) {
                $tw.hooks.invokeHook("th-deleting-tiddler", configTiddler);
                $tw.wiki.deleteTiddler(configTiddlerTitle);
            }
        });

        $tw.rootWidget.dispatchEvent({ type: "tm-auto-save-wiki" });
    });

    $tw.hooks.addHook("th-relinking-tiddler", function (newTiddler, tiddler) {
        // If a volant tiddler is relinked (presumably for being renamed), rename the 
        // configuration tiddler also
        if (newTiddler.hasTag($tw.Volant.configTiddlerTag)) {
            const newTitle = newTiddler.fields.prefix + newTiddler.fields.list[0];
            const newConfigTiddler = new $tw.Tiddler(newTiddler, { title: newTitle }, $tw.wiki.getModificationFields());
            $tw.wiki.deleteTiddler(tiddler.fields.title);
            $tw.wiki.relinkTiddler(newTiddler.fields.title, newTitle);
            return newConfigTiddler;
        }
    });

    $tw.hooks.addHook("th-navigating", function (event) {
        // If a volant tiddler is the target of navigation, push it onto the zstack
        const toTitle = event.navigateTo;
        const tiddler = document.querySelector(`[data-tiddler-title="${toTitle}"]`);
        if (tiddler && tiddler.matches(".volant")) {
            $tw.Volant.pushTiddlerToZStack(tiddler);
        }
        return event;
    });

})();
