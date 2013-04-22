/*jslint browser:true, nomen:true, devel:true */
/*global document, jQuery */
/*
 * jQuery DragSwipe UI Widget v0.1.1
 * Copyright (c) 2013 Bart Conrad
 *
 * http://www.hippomanager.com/community/developers/plugins/dragswipe/
 *
 * Depends:
 *   - jQuery 1.9.1+
 *   - jQuery UI 1.10.2 widget factory
 *
 * Licensed under the GPL licenses:
 *   http://www.gnu.org/licenses/gpl.html
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function ($) {
    "use strict";

    $.widget("hip.dragswipe", $.ui.draggable, {
        options: {
            addClasses:     true,
            axis:           'x',
            removeOnSwipe:  false,
            revertDuration: 200,
            swipe:          $.noop,
            swipeDistance:  150
        },
        _create: function () {
            var self = this,
                el = self.element,
                o = self.options;

            if (o.addClasses) {
                el.addClass('hip-dragswipe');
            }

            el.uniqueId(); // Give each instance a unique id

            self.element.data("draggable", this); // Fixes TypeError
            self.element.data("uiDraggable", this); // Fixes TypeError
            self._super();
        },
         /**
          * Calculates the change in position.  It adds both axes if the "axis"
          * option is set to false.
          * 
          * @param {object} oldPosition     jQuery element position
          * @param {object} newPosition     jQuery element position
          * @returns {int}                  total change in position
          */
        _positionChange: function (oldPosition, newPosition) {
            var o =         this.options,
                change;

            switch (o.axis) {
            case 'x':
                change = Math.abs(oldPosition.left - newPosition.left);
                break;
            case 'y':
                change = Math.abs(oldPosition.top - newPosition.top);
                break;
            default:
                change = Math.abs(oldPosition.left - newPosition.left) +
                    Math.abs(oldPosition.top - newPosition.top);
            }

            return change;
        },
        /**
         * Tests if the distance the element has been dragged is greater than
         * the threshold set in the "swipeDistance" option.
         *
         * @return  {Boolean}
         */
        _isSwipeDistance: function () {
            return (this._positionChange(this.originalPosition, this.position)
                > this.options.swipeDistance);
        },
        /**
         * Adds or removes the "hip-state-swipe" class from the element
         * depending on whether or not the element has moved farther than the
         * swipe distance.
         */
        _markSwipDistance: function () {
            if (this._isSwipeDistance()) {
                this.element.addClass('hip-dragswipe-state-swipe');
            } else {
                this.element.removeClass('hip-dragswipe-state-swipe');
            }
        },
         /**
          * Overrides the jQuery UI method, adding functionality to detect the
          * distance that the element was moved.
          * 
          * @param {Object} event   Mouse Event
          * @returns {Boolean}
          */
        _mouseStop: function (event) {
            var element,
                self = this,
                elementInDom = false,
                originalPosition = this.originalPosition,
                position = this.position,
                positionChange =
                    self._positionChange(originalPosition, position);

            //If the original element is no longer in the DOM don't bother
            //to continue (see #8269)
            element = this.element[0];
            while (element && (element = element.parentNode)) {
                if (element === document) {
                    elementInDom = true;
                }
            }
            if (!elementInDom && this.options.helper === "original") {
                return false;
            }

            //Calls the "swipe" method if the elements position change is
            //beyond the threshold set to the "swipeDistance" option.
            if (positionChange > this.options.swipeDistance) {
                this.swipe(event, this);
            }

            //Resets the position of the element
            $(this.helper).animate(originalPosition,
                parseInt(this.options.revertDuration, 10), function () {
                    self.position = self.originalPosition;
                    self._markSwipDistance();
                    if (self._trigger("stop", event) !== false) {
                        self._clear();
                    }
                });

            return false;
        },
        /**
         * Adds "_markSwipDistance" method to the original jQuery method.
         * 
         * @param {Object}  event
         * @param {Boolean} noPropagation
         */
        _mouseDrag: function (event, noPropagation) {
            this._super(event, noPropagation);
            this._markSwipDistance();
        },
        /**
         * Removes the element from the Dom if the "removeOnSwipe" option is
         * set to true and triggers the "swipe" event.
         * 
         * @param {Object} event
         * @param {Object} ui
         */
        swipe: function (event, ui) {
            this._remove();
            this._trigger('swipe', event, ui);
        },
        /**
         * Removes the element from the Dom if the "removeOnSwipe" option is
         * set to true.
         */
        _remove: function () {
            var self = this,
                el = self.element,
                o = self.options;

            if (o.removeOnSwipe) {
                el.remove();
            }
        },
        _destroy: function () {
            var self = this,
                el = self.element;

            el.removeClass('hip-dragswipe');
            self._super();
        }
    });
}(jQuery));