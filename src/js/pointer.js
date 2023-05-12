/**
 * Based on "Pointer.js", by Gustav Genberg.
 * https://github.com/GustavGenberg/handy-front-end#pointerjs
 */

export class Pointer {
    constructor(element) {
        this.x = null;
        this.y = null;

        this.element = element;

        this.cursor = element.style.cursor;

        this.buttonsDown = [];

        this.mousedown = {};
        this.mouseup   = {};

        this.clickHistory = [];
        this.moveHistory  = [];

        this.listeners = new Map();

        // Event listeners

        window.addEventListener('click', (e) => {
            if (!this.isDown(e.button)) { this.buttonsDown.push(e.button) };

            this.triggerFunction('click', this.getEventObj(e));
        });

        window.addEventListener('mousedown', (e) => {
            if (!this.isDown(e.button)) { this.buttonsDown.push(e.button) };

            const obj = this.getEventObj(e);
            
            this.mousedown[e.button] = obj;
            this.mouseup[e.button]   = { x: null, y: null, time: null, buttons: null, event: null };

            this.triggerFunction('down', obj);
        });

        window.addEventListener('mouseup', (e) => {
            if (this.isDown(e.button)) { this.buttonsDown.splice( this.buttonsDown.indexOf(e.button), 1) };

            const obj = this.getEventObj(e);

            this.clickHistory.push({
                startX: this.mousedown[e.button].x,
                startY: this.mousedown[e.button].y,
                time: +new Date(),
                button: e.button,
                startEvent: this.mousedown[e.button].event,
                endX: obj.x,
                endY: obj.y,
                endEvent: obj.e
            });

            this.mouseup[e.button]   = obj;
            this.mousedown[e.button] = { x: null, y: null, time: null, buttons: null, event: null };

            this.triggerFunction('up', this.getEventObj(e));
        });

        window.addEventListener('mousemove', (e) => {
            this.x = e.clientX;
            this.y = e.clientY;

            const obj = this.getEventObj(e);

            if (e.buttons < 1) { this.buttonsDown.splice(0, this.buttonsDown.length) };

            this.moveHistory.push(obj);

            this.triggerFunction('move', obj);
        });

        window.addEventListener('contextmenu', (e) => {
            // TO-DO
            this.triggerFunction('contextmenu', this.getEventObj(e));
        });
    }

    /**
     * Functions
     */

    getEventObj(event) {
        return {
            x: event.clientX,
            y: event.clientY,
            time: +new Date(),
            buttons: this.buttonsDown,
            event: event,
        };
    }

    on(type, callback) {
        this.listeners.set(type, callback);
        return this;
    }

    triggerFunction(type, callback) {
        if (this.listeners.has(type)) {
            this.listeners.get(type).call(this, callback);
        }
    }

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

    update() {
        this.element.style.cursor = this.cursor;
    }
}
