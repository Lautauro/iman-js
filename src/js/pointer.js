/**
 * Based on "Pointer.js", by Gustav Genberg.
 * https://github.com/GustavGenberg/handy-front-end#pointerjs
 */

export class Pointer {
    constructor(element) {
        
        /**
         * The parent element.
         */

        this.element = element;

        /**
         * Buttons values.
         */

        this.BTN_LEFT = 0;
        this.BTN_MIDDLE = 1;
        this.BTN_RIGHT = 2;

        /**
         * Pointer coordinates.
         */

        this.x = null;
        this.y = null;

        /**
         * Style of the cursor.
         */

        this.cursor = element.style.cursor;

        /**
         * List of buttons down.
         */

        this.buttonsDown = [];

        this.mouseDown = {};
        this.mouseUp   = {};

        [this.BTN_LEFT, this.BTN_MIDDLE, this.BTN_RIGHT].forEach(function (button) {
            this.mouseDown[button] = this.mouseUp[button] = { x: null, y: null, time: null, buttons: null, event: null };
        }.bind(this));

        /**
         * Mouse hover.
         */

        this.mouseHover = null;

        /**
         * Mouse clicked element.
         */

        this.clickedElement = null;

        /**
         * History of clicks and mouse movements.
         */

        this.clickHistory = [];
        this.moveHistory  = [];

        /**
         * The listener map that the on() functions will be stored in.
         */

        this.listeners = new Map();

        /**
         * Event listeners.
         */

        /**
         * Mouse down.
         */

        window.addEventListener('mousedown', (e) => {
            if (!this.isDown(e.button)) { this.buttonsDown.push(e.button) };

            const obj = this.getEventObj(e);
            
            this.mouseDown[e.button] = obj;
            this.mouseUp[e.button]   = { x: null, y: null, time: null, buttons: null, event: null };

            this.triggerFunction('down', obj);

            /**
             * Trigger onMouseDown function on clicked element.
             */

            if (this.clickedElement && this.clickedElement.interactive) {
                if (typeof this.clickedElement.onMouseDown == 'function') {
                    this.clickedElement.onMouseDown(obj);
                }
            }

        });

        /**
         * Mouse up.
         */

        window.addEventListener('mouseup', (e) => {
            if (this.isDown(e.button)) { this.buttonsDown.splice( this.buttonsDown.indexOf(e.button), 1) };

            const obj = this.getEventObj(e);

            this.clickHistory.push({
                startX: this.mouseDown[e.button].x,
                startY: this.mouseDown[e.button].y,
                time: +new Date(),
                button: e.button,
                startEvent: this.mouseDown[e.button].event,
                endX: obj.x,
                endY: obj.y,
                endEvent: obj.e
            });

            this.mouseUp[e.button]   = obj;
            this.mouseDown[e.button] = { x: null, y: null, time: null, buttons: null, event: null };

            this.triggerFunction('up', this.getEventObj(e));

            /**
             * Trigger onMouseUp function on clicked element.
             */

            if (this.clickedElement && this.clickedElement.interactive) {
                if (typeof this.clickedElement.onMouseUp == 'function') {
                    this.clickedElement.onMouseUp(obj);
                }
            }
        });

        /**
         * Mouse click.
         */

        window.addEventListener('click', (e) => {
            if (!this.isDown(e.button)) { this.buttonsDown.push(e.button) };

            const obj = this.getEventObj(e);

            this.triggerFunction('click', obj);

            /**
             * Trigger onMouseClick function on clicked element.
             */

            if (this.clickedElement && this.clickedElement.interactive) {
                if (typeof this.clickedElement.onMouseClick == 'function') {
                    this.clickedElement.onMouseClick(obj);
                }

                this.clickedElement = null;
            }
        });


        /**
         * Mouse move.
         */

        window.addEventListener('mousemove', (e) => {
            this.x = e.clientX;
            this.y = e.clientY;

            const obj = this.getEventObj(e);

            if (e.buttons < 1) { this.buttonsDown.splice(0, this.buttonsDown.length) };

            this.moveHistory.push(obj);

            this.triggerFunction('move', obj);

            /**
             * Trigger onMouseMove function on clicked element.
             */

            if (this.clickedElement && this.clickedElement.interactive) {
                if (typeof this.clickedElement.onMouseMove == 'function') {
                    this.clickedElement.onMouseMove(obj);
                }
            }
        });

        /**
         * Context menu
         */

        window.addEventListener('contextmenu', (e) => {
            // TO-DO
            this.triggerFunction('contextmenu', this.getEventObj(e));
        });
    }

    /**
     * Generates event object.
     * @param {object} event 
     * @returns Event object.
     */

    getEventObj(event) {
        return {
            /**
             * X position, relative to top left of the parent element.
             */

            x: event.clientX,

            /**
             * Y position, relative to top left of the parent element.
             */

            y: event.clientY,

            /**
             * Timestamp.
             */

            time: +new Date(),

            /**
             * Button down.
             */

            buttons: this.buttonsDown,

            /**
             * Raw data of the mouse event.
             */
                
            event: event,
        };
    }

    /**
     * Appends an event listener for events whose type attribute value is type. 
     * The callback argument sets the callback that will be invoked when the event is dispatched.
     * 
     * @param {string} type 
     * @param {listener} callback 
     * 
     * @callback listener
     * 
     * @returns {this}
     */

    on(type, callback) {
        this.listeners.set(type, callback);
        return this;
    }

    /**
     * Triggers the callback of an event listener if it exists.
     * @param {string} type 
     * @param {listener} callback 
     * 
     * @callback listener
     */

    triggerFunction(type, callback) {
        if (this.listeners.has(type)) {
            this.listeners.get(type).call(this, callback);
        }
    }

    /**
     * Check if button is down.
     * @param {number} button 
     * @returns {boolean}
     */

    isDown(button) {
        return this.buttonsDown.indexOf(button) > -1;
    }

    getLastClick(button) {
        if (this.clickHistory.length == 0) { return null };

        for (let i = this.clickHistory.length -1; i >= 0; i--) {
            if (this.clickHistory[i].buttons == button) {
                return this.clickHistory[i];
            }
        }

        return null;
    }

    getClickHistory(index, button) {
        if (this.clickHistory.length == 0) { return null };
        if (!index) { return this.clickHistory };

        if (index > 0) {
            if (button) {
                let numberOfElement = 1;

                for (let i = 0; i < this.clickHistory.length; i++) {
                    if (this.clickHistory[i].button == button) {
                        if (numberOfElement == index) { return this.clickHistory[i] };
                        numberOfElement++;
                    }
                }

                return null;
            } else {
                return this.clickHistory[index - 1];
            }
        } else if (index < 0) {
            if (button) {
                index = Math.abs(index);
                let numberOfElement = 1;

                for (let i = this.clickHistory.length - 1; i >= 0; i--) {
                    if (this.clickHistory[i].button == button) {
                        if (numberOfElement == index) { return this.clickHistory[i] };

                        numberOfElement++;
                    }
                }

                return null;
            }

            return this.clickHistory[this.clickHistory.length - Math.abs(index)];
        }
    }

    getMoveHistory(num) {
        if (num) {
            if (num > 0) {
                return this.moveHistory[num - 1];
            } else if (num < 0) {
                return this.moveHistory[this.moveHistory.length - Math.abs(num)];
            }
        } else {
            return this.moveHistory;
        }
    }

    /**
     * Update the cursor style.
     */

    update() {
        if (this.mouseHover && this.mouseHover.interactive) {
            this.cursor = 'pointer';
        } else {
            this.cursor = 'default';
        }

        this.element.style.cursor = this.cursor;
    }
}
