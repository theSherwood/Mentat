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

		tiddlerDrag: function (e) {
			// Hooks
			e = $tw.hooks.invokeHook("volant-tiddler-drag", e);
			if(!e) {
				return;
			}
			e.stopPropagation();
			e.preventDefault();
			const Volant = $tw.Volant;
			const tiddler = Volant.eventTiddler
			window.requestAnimationFrame(() => {
				// calculate the new cursor/pointer position:
				Volant.pos1 = Volant.pos3 - (e.clientX || (e.touches && e.touches[0].clientX) || 0);
				Volant.pos2 = Volant.pos4 - (e.clientY || (e.touches && e.touches[0].clientY) || 0);
				Volant.pos3 = (e.clientX || (e.touches && e.touches[0].clientX) || Volant.pos3);
				Volant.pos4 = (e.clientY || (e.touches && e.touches[0].clientY) || Volant.pos4);
				// get dimensions
				const top = tiddler.offsetTop;
				const left = tiddler.offsetLeft;
				// style tiddler element
				tiddler.style.top = (top - Volant.pos2) + "px";
				tiddler.style.left = (left - Volant.pos1) + "px";
			});

		},

		endDrag: function (e) {
			// stop moving when mouse button is released or pointer is removed:
			const Volant = $tw.Volant;

			// Hooks
			e = $tw.hooks.invokeHook("volant-end-drag", e);
			if(!e) {
				return;
			}

			window.requestAnimationFrame(() => {
				Volant.snapToGrid();
				Volant.logNewDimensions();
			});

			window.removeEventListener('touchmove', Volant.tiddlerDrag);
			window.removeEventListener('touchend', Volant.endDrag, false);
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
			// Hooks
			const hookObject = $tw.hooks.invokeHook("volant-log-new-dimensions", {
				tiddler: tiddler,
				configTiddlerTitle: configTiddlerTitle
			});
			tiddler = hookObject.tiddler;
			configTiddlerTitle = hookObject.configTiddlerTitle;
			if (!tiddler) {
				return;
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
			// Hooks
			tiddlerElement = $tw.hooks.invokeHook("volant-push-tiddler-to-zstack", tiddlerElement);
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

			let zStack = Volant.zStack;
			// Log zStack to the list of $:/state/zStack
			const zList = zStack.map(tiddlerElement => tiddlerElement.dataset.tiddlerTitle).slice(-20);
			const zStackTiddler = $tw.wiki.getTiddler("$:/state/zStack");
			$tw.wiki.addTiddler(new $tw.Tiddler(
				{ title: "$:/state/zStack" },
				zStackTiddler,
				{ list: zList }
			));

			// Hooks
			zStack = $tw.hooks.invokeHook("volant-evaluate-zstack", zStack);

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
			let posx =
        e.clientX || (e.touches && e.touches[0].clientX) || undefined;
			let posy =
        e.clientY || (e.touches && e.touches[0].clientY) || undefined;
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
			e.stopPropagation();

			const tiddler = $tw.Volant.eventTiddler;
			let posx =
				e.clientX || (e.touches && e.touches[0].clientX) || undefined;
			let posy =
				e.clientY || (e.touches && e.touches[0].clientY) || undefined;
			const viewportOffset = tiddler.getBoundingClientRect();

			window.requestAnimationFrame(() => {
				tiddler.style.width = (posx - viewportOffset.left + 5) + 'px';
				tiddler.style.height = (posy - viewportOffset.top + 5) + 'px';
			});
		},

		endResize: function (e) {
			const Volant = $tw.Volant;

			// Hooks
			e = $tw.hooks.invokeHook("volant-end-resize", e);
			if(!e) {
				return;
			}

			window.requestAnimationFrame(() => {
				Volant.snapToGrid();
				Volant.logNewDimensions()
			});

			window.removeEventListener('touchmove', Volant.resizeLeft);
			window.removeEventListener('touchmove', Volant.resizeRight);
			window.removeEventListener('touchend', Volant.endResize, false);
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
			// Hooks
			return $tw.hooks.invokeHook("volant-get-event-tiddler", tiddler);
		},

		snapToGrid: function (tiddler) {
			// Take the tiddler position and snap it to an implicit grid ($tw.Volant.grid)
			const Volant = $tw.Volant;
			if (tiddler === undefined) {
				tiddler = Volant.eventTiddler;
			}
			Volant.getGrid();

			// Hooks
			tiddler = $tw.hooks.invokeHook("volant-snap-to-grid", tiddler);
			if (!tiddler) {
				return;
			}

			const positionIsFixed = (tiddler.style.position === "fixed");
			let gridgap;
			if (positionIsFixed) {
				// position by percentage of viewport
				gridgap = Number($tw.wiki.getTiddler("$:/plugins/admls/volant/config/values").fields.fixedgridgap) || 0;

				const top = Volant.convertToGridValue(tiddler.offsetTop - gridgap, positionIsFixed, "height");
				const left = Volant.convertToGridValue(tiddler.offsetLeft - gridgap, positionIsFixed, "width");
				const height = Volant.convertToGridValue(tiddler.offsetHeight + 2 * gridgap, positionIsFixed, "height");
				const width = Volant.convertToGridValue(tiddler.offsetWidth + 2 * gridgap, positionIsFixed, "width");

				tiddler.style.cssText += `top:calc(${top}% + ${gridgap}px);`;
				tiddler.style.cssText += `left:calc(${left}% + ${gridgap}px);`;
				tiddler.style.cssText += `height:calc(${height}% - 2 * ${gridgap}px);`;
				tiddler.style.cssText += `width:calc(${width}% - 2 * ${gridgap}px);`;
			} else { // position is absolute
				// position by pixel coordinates
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
				fixedGridSize: Number($tw.wiki.getTiddler("$:/plugins/admls/volant/config/values").fields.fixedgridsize) || 0.1,
				absoluteGridSize: Number($tw.wiki.getTiddler("$:/plugins/admls/volant/config/values").fields.absolutegridsize) || 1
			}
		},

		convertToGridValue(number, positionIsFixed, direction) {
			// Convert a positional value to a value that lays on the implicit grid
			const grid = $tw.Volant.grid;
			// Fixed and absolute use different grid schemes
			if (positionIsFixed) { // fixed grid uses a percentage of the viewport
				const viewportValue = (direction === "width") ? grid.viewportWidth : grid.viewportHeight;
				let percentage = (number / viewportValue) * 100;
				return Math.round(percentage / grid.fixedGridSize) * grid.fixedGridSize;
			} else { // absolute grid is an absolute number of pixels
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
