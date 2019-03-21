/*\
created: 20190201185751112
type: application/javascript
title: $:/plugins/admls/volant/globals/volant.js
tags: 
modified: 20190311213957925
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
        // touchIsEnabled: true,

        tiddlerDrag: function (e) {
            // debugger;
            if(!$tw.Volant.touchIsEnabled) {
                e.stopPropagation();
            }
            e.preventDefault();
            const Volant = $tw.Volant;
            const tiddler = Volant.eventTiddler
            const title = tiddler.dataset.tiddlerTitle;
            window.requestAnimationFrame(() => {
                // console.log('TIDDLERDRAG', e);
                // calculate the new cursor position:
                Volant.pos1 = Volant.pos3 - (e.clientX || e.touches[0].clientX);
                Volant.pos2 = Volant.pos4 - (e.clientY || e.touches[0].clientY);
                Volant.pos3 = (e.clientX || e.touches[0].clientX);
                Volant.pos4 = (e.clientY || e.touches[0].clientY);
                // get dimensions
                const top = tiddler.offsetTop;
                const left = tiddler.offsetLeft;
                // style tiddler element
                tiddler.style.top = (top - Volant.pos2) + "px";
                tiddler.style.left = (left - Volant.pos1) + "px";
            });

        },

        endDrag: function (e) {
            // stop moving when mouse button is released:
            const Volant = $tw.Volant;

            // console.log('ENDDRAG', e);

            window.requestAnimationFrame(() => {
                Volant.snapToGrid();
                Volant.logNewDimensions();
            });

            // Volant.detachEventListener(window, 'touchmove panmove drag pointermove mousemove', Volant.tiddlerDrag);
            // Volant.detachEventListener(window, 'panend pancancel touchend mouseup dragend draginitup pointerup', Volant.endDrag);
            // const Hammer = window.Hammer;
            // Hammer.off(window, 'mousemove', Volant.tiddlerDrag);
            // Hammer.off(window, 'mouseup', Volant.endDrag, false);
            window.removeEventListener('touchmove', Volant.tiddlerDrag);
            window.removeEventListener('touchend', Volant.endDrag, false);
            // window.removeEventListener('mousemove', Volant.tiddlerDrag);
            // window.removeEventListener('mouseup', Volant.endDrag, false);
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
                this.eventTiddler = undefined;
                this.configTiddlerTitle = undefined;
            }, 500);

        },

        removeStyle: function (tiddler) {
            // Removes position styling from the tiddler so css can take effect
            tiddler.style.top = "";
            tiddler.style.left = "";
            tiddler.style.height = "";
            tiddler.style.width = "";
        },

        pushTiddlerToZStack: function (tiddlerElement) {
            // Adds tiddler to click and navigation history stored as $tw.Volant.zStack
            const Volant = $tw.Volant;
            if (!tiddlerElement) {
                return;
            };
            const title = tiddlerElement.dataset.tiddlerTitle;
            Volant.zStack = Volant.zStack.filter(tiddlerElement => tiddlerElement.dataset.tiddlerTitle !== title)
            Volant.zStack.push(tiddlerElement);
            Volant.evaluateZStack();
        },

        evaluateZStack: function () {
            // Logs zStack to a tiddler and handles overlapping (by adjusting z-index values)
            const Volant = $tw.Volant;

            const zStack = Volant.zStack;
            // Log zStack to the list of $:/state/zStack
            const zList = zStack.map(tiddlerElement => tiddlerElement.dataset.tiddlerTitle).slice(-20);
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
            if(!$tw.Volant.touchIsEnabled) {
                e.stopPropagation();
            }
            const tiddler = $tw.Volant.eventTiddler;
            let posx = (e.clientX || e.touches[0].clientX);
            let posy = (e.clientY || e.touches[0].clientY);
            const viewportOffset = tiddler.getBoundingClientRect();

            window.requestAnimationFrame(() => {
                tiddler.style.height = (posy - viewportOffset.top + 5) + 'px';
                if (tiddler.style.position === "fixed") {
                    tiddler.style.width = (tiddler.offsetWidth + tiddler.offsetLeft - posx + 5) + 'px';
                    tiddler.style.left = (posx - 5) + 'px';
                } else {
                    tiddler.style.left = (window.scrollX + posx - 5) + 'px';
                    tiddler.style.width = (tiddler.offsetWidth + viewportOffset.left - posx + 5) + 'px';
                }
            });
        },

        resizeRight: function (e) {
            // Resize the tiddler by the right resizer
            e.preventDefault();
            if(!$tw.Volant.touchIsEnabled) {
                e.stopPropagation();
            }
            const tiddler = $tw.Volant.eventTiddler;

            const viewportOffset = tiddler.getBoundingClientRect();

            window.requestAnimationFrame(() => {
                tiddler.style.width = ((e.clientX || e.touches[0].clientX) - viewportOffset.left + 5) + 'px';
                tiddler.style.height = ((e.clientY || e.touches[0].clientY) - viewportOffset.top + 5) + 'px';
            });
        },

        endResize: function () {
            const Volant = $tw.Volant;

            window.requestAnimationFrame(() => {
                Volant.snapToGrid();
                Volant.logNewDimensions()
            });

            // Volant.detachEventListener(window, 'mousemove', Volant.resizeLeft);
            // Volant.detachEventListener(window, 'mousemove', Volant.resizeRight);
            // Volant.detachEventListener(window, 'mouseup', Volant.endResize);
            // const Hammer = window.Hammer;
            // Hammer.off(window, 'mousemove', Volant.resizeLeft);
            // Hammer.off(window, 'mousemove', Volant.resizeRight);
            // Hammer.off(window, 'mouseup', Volant.endResize, false);
            window.removeEventListener('touchmove', Volant.resizeLeft);
            window.removeEventListener('touchmove', Volant.resizeRight);
            window.removeEventListener('touchend', Volant.endResize, false);
            // window.removeEventListener('mousemove', Volant.resizeLeft);
            // window.removeEventListener('mousemove', Volant.resizeRight);
            // window.removeEventListener('mouseup', Volant.endResize, false);
        },

        getEventTiddler: function (e) {
            // console.log(e);
            let elmnt = e.target;
            // Get the volant tiddler that the event happened in
            while (!(elmnt.matches('.volant'))) {
                // Stop if you get to the root element
                if (elmnt.tagName === "HTML") {
                    return;
                }
                elmnt = elmnt.parentElement;
            }
            if(!$tw.Volant.touchIsEnabled) {
                e.stopPropagation();
            }
            const tiddler = elmnt;
            return tiddler;
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
                gridgap = Number($tw.wiki.getTiddler("$:/plugins/admls/volant/config/values").fields.fixedgridgap) || 0;

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
        },

        getGrid: function () {
            // Get size of grid cells
            $tw.Volant.grid = {
                viewportWidth: document.documentElement.clientWidth, // excludes scrollbars
                viewportHeight: document.documentElement.clientHeight,
                // Different grids for fixed and absolute tiddlers
                fixedGridSize: Number($tw.wiki.getTiddler("$:/plugins/admls/volant/config/values").fields.fixedgridsize) || 1,
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
                return Math.round(percentage / grid.fixedGridSize) * grid.fixedGridSize;
            } else { // absolute grid is a number of pixels
                const quotient = number / grid.absoluteGridSize;
                return Math.round(Math.round(quotient) * grid.absoluteGridSize);
            }
        },

        attachEventListener(element, eventType, callback, thisArg) {
            let eventString;
            if ($tw.Volant.touchIsEnabled) {  
                switch (eventType) {
                    case 'start':
                    eventString = 'panstart dragstart draginit touchstart pointerdown';
                    break;
                    case 'move':
                    eventString = 'touchmove panmove drag pointermove mousemove';
                    break;
                    case 'end':
                    eventString = 'panend pancancel touchend mouseup dragend draginitup pointerup';
                    break;
                }
                if ($tw.browser && !window.Hammer) {
                    window.Hammer = require("$:/plugins/tiddlywiki/hammerjs/hammer.js");
                }
                const Hammer = window.Hammer;
                if (element === window) {
                    Hammer.on(window, eventString, callback);
                    return;
                }
                if (thisArg) {
                    if (!thisArg.hammer) {
                        thisArg.hammer = new Hammer.Manager(element);
                        thisArg.hammer.add(new Hammer.Pan({
                            event: 'pan',
                            pointers: 1,
                            threshold: 0,
                            direction: Hammer.DIRECTION_ALL
                        }));
                    }
                    thisArg.hammer.on(eventString, callback);
                } else {
                    const Hammer = window.Hammer;
                    Hammer.on(eventString, callback);
                }
            } else {
                switch (eventType) {
                    case 'start':
                    eventString = 'mousedown';
                    break;
                    case 'move':
                    eventString = 'mousemove';
                    break;
                    case 'end':
                    eventString = 'mouseup';
                    break;
                }
                
                element.addEventListener(eventString, callback, false);
                
            }
        },

        detachEventListener(element, eventTypes, callback, thisArg) {
            if ($tw.Volant.touchIsEnabled) {
                if ($tw.browser && !window.Hammer) {
                    window.Hammer = require("$:/plugins/tiddlywiki/hammerjs/hammer.js");
                }
                const Hammer = window.Hammer;
                if (element === window) {
                    Hammer.off(window, eventTypes, callback);
                    return;
                }
                if (thisArg) {
                    if (!thisArg.hammer) {
                        thisArg.hammer = new Hammer.Manager(element);
                        thisArg.hammer.add(new Hammer.Pan({
                            event: 'pan',
                            pointers: 1,
                            threshold: 0,
                            direction: Hammer.DIRECTION_ALL
                        }));
                    }
                    thisArg.hammer.off(eventTypes, callback);
                } else {
                    const Hammer = window.Hammer;
                    Hammer.off(eventTypes, callback);
                }
            } else {
                eventTypes.split(' ').forEach(eventType => {
                    element.removeEventListener(eventTypes, callback, false);
                });
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
