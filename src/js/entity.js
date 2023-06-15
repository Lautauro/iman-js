import { V2 } from './vector.js';

export const ENTITIES = new Map([
    ['image', []], 
    ['manipulation', []],   
    ['menu', []],           /* TO-DO */
    ['generic', []],
]);

export class Entity {
    /**
     * 
     * @param {Object} obj
     *      @param {number}  obj.x 
     *      @param {number}  obj.y
     *      @param {boolean} obj.visible
     *      @param {number}  obj.originX
     *      @param {number}  obj.originY
     *      @param {number}  obj.width
     *      @param {number}  obj.height
     *      @param {number}  obj.angle
     *      @param {object}  obj.parent - Creator.
     *      @param {boolean} obj.interactive
     *      @param {string}  obj.type - "image", to-do, etc.
     *      @param {function} obj.onMouseDown
     *      @param {function} obj.onMouseUp
     *      @param {function} obj.onMouseClick
     *      @param {function} obj.onMouseMove
     */
    constructor(obj) {

        this.id = ENTITIES.length ? ENTITIES[ ENTITIES.length - 1 ].id + 1 : 0;

        /**
         * Coordinates of the Entity.
         */

        this.pos = new V2( obj.x, obj.y );

        this.properties = {
            origin:     new V2(obj.originX ?? 0, obj.originY ?? 0),
            visible:     obj.visible       ?? true,
            width:       obj.width         ?? 0,
            height:      obj.height        ?? 0,
            angle:       obj.angle         ?? 0,       // TO-DO
            alpha:       obj.alpha         ?? 1,
            fillColor:   obj.fillColor     ?? '#6b6b6b',
            strokeColor: obj.strokeColor   ?? '#6b6b6b',
        };

        this.name = obj.name ?? 'none';
        
        /**
         * Parent
        */

        this.parent = obj.parent;
       
        /**
        * Defines if the Entity can interact with the mouse.
        */
      
        this.interactive = obj.interactive ?? true;

        /**
        * Defines if the Entity can be moved by the mouse.
        */

        this.draggable    = obj.draggable   ?? false;

        /**
         * Event listeners
         */

        this.onMouseDown  = obj.onMouseDown;
        this.onMouseUp    = obj.onMouseUp;
        this.onMouseClick = obj.onMouseClick;
        this.onMouseMove  = obj.onMouseMove;

        /**
         * Type of Entity. Ex: image, button (TO-DO), etc...
         */
        
        this.type = obj.type ?? 'generic';

        switch (obj.type) {

            /**
             * Image type
             */

            case 'image': {
                this.img         = obj.img          ?? new Image();
                this.img.onerror = obj.img?.onerror ?? obj.onerror;
                this.img.onload  = obj.img?.onload  ?? obj.onload;
                this.img.src     = obj.src;
            }

        }

        /**
         * Add Entity to the list.
         */

        if (ENTITIES.has(this.type)) {
            ENTITIES.get(this.type).push(this);
        } else {
            ENTITIES.set(this.type, [this]);
        }

    }

    /**
     * Check if entity collide.
     * @param {number} x coordinates.
     * @param {number} y coordinates.
     * @returns {boolean}
     */

    checkPointCollision(x, y) {
        const xOffset  = this.properties.width  < 0 ? Math.abs(this.properties.width)  : 0;
        const yOffset  = this.properties.height < 0 ? Math.abs(this.properties.height) : 0;

        if (x >= this.pos.x - this.properties.origin.x - xOffset && 
            x <= this.pos.x - this.properties.origin.x + Math.abs(this.properties.width)  - xOffset &&
            y >= this.pos.y - this.properties.origin.y - yOffset &&
            y <= this.pos.y - this.properties.origin.y + Math.abs(this.properties.height) - yOffset) {
            
            return true;
        } else {
            return false;
        }
    }

    /**
     * Delete this Entity.
     * @returns {this}
     */

    delete() {
        const list = ENTITIES.get(this.type);

        for (let i = 0; i < list.length; i++) {
            if (list[i] == this) {
                list.splice(i, 1);
                return this;
            }
        }
    }

    /**
     * Move this Entity to a relative position.
     * @param {number} x coordinates.
     * @param {number} y coordinates.
     * @returns {this}
     */

    move(x = 0, y = 0) {
        this.pos.x += x;
        this.pos.y += y;

        if (this.onmove) {
            this.onmove(this);
        }

        return this;
    }

    /**
     * Set position of this Entity.
     * @param {number} x coordinates.
     * @param {number} y coordinates.
     * @returns {this}
     */

    setPos(x, y) {
        this.pos.x = x ?? this.pos.x;
        this.pos.y = y ?? this.pos.y;

        if (this.onmove) {
            this.onmove(this);
        }

        return this;
    }
}