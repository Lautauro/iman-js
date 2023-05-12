import { V2 } from './vector.js';

export const ENTITIES = [];

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
     *      @param {boolean} obj.interactive
     *      @param {string}  obj.type - "image", to-do, etc.
     */
    constructor(obj) {

        /**
         * Coordinates of the Entity.
         */

        this.pos = new V2( obj.x, obj.y );

        this.properties = {
            visible:    obj.visible ?? true,
            originX:    obj.originX ?? 0,
            originY:    obj.originY ?? 0,
            width:      obj.width   ?? 0,
            height:     obj.height  ?? 0,
            angle:      obj.angle   ?? 0,       // TO-DO
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
         * Event listeners
         */

        this.onclick = obj.onclick;
        this.onmove  = obj.onmove;
        
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

            // TO-DO: Menu, idk something lol.
        }

        ENTITIES.push(this);
    }

    // Test, I don't know if I'm ever going to use this.
    static distanceBetween(entity1, entity2) {
        return entity1.pos.dis(entity2);
    }

    /**
     * Check if entity collide.
     * @param {number} x 
     * @param {number} y 
     * @returns {boolean}
     */

    checkPointCollision(x, y) {
        if (x >= this.pos.x - this.properties.originX && 
            x <= this.pos.x - this.properties.originX + this.properties.width &&
            y >= this.pos.y - this.properties.originY &&
            y <= this.pos.y - this.properties.originY + this.properties.height) {
            
            return true;
        } else {
            return false;
        }
    }

    delete() {
        for (let i = 0; i < ENTITIES.length; i++) {
            if (ENTITIES[i] == this) {
                ENTITIES.splice(i, 1);
                return this;
            }
        }
    }

    move(x = 0, y = 0) {
        this.pos.x += x;
        this.pos.y += y;

        if (this.onmove) {
            this.onmove(this);
        }
    }

    setPos(x, y) {
        this.pos.x = x ?? this.pos.x;
        this.pos.y = y ?? this.pos.y;

        if (this.onmove) {
            this.onmove(this);
        }
    }
}