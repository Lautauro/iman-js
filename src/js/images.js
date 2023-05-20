import { Entity, ENTITIES } from './entity.js';
import { V2 } from './vector.js';

/**
 * Types of image manipulation.
 */

export const MANIPULATOR_TYPE = Object.freeze({
    'MOVE':      Symbol(),
    'TRANSFORM': Symbol(),
    'CROP':      Symbol(),
});

export class Images {
    constructor() {

        /**
         * List of images created.
         */

        this.list = ENTITIES.get('image');

        /**
         * Selection list.
         * TO-DO: Select multiple images.
         */

        this.selected = new Set();

        /**
         * Type of image manipulation:
         *      MANIPULATOR_TYPE.MOVE, 
         *      MANIPULATOR_TYPE.TRANSFORM,
         *      MANIPULATOR_TYPE.CROP ...
         */

        this.manipulator = MANIPULATOR_TYPE.MOVE;

        this.transform = new ImageTransform();
    }

    /**
     * Create a new image and add it to de list.
     * @param {Object} obj              - Properies of the image 
     *      @param {number} obj.x       - Image x coords.
     *      @param {number} obj.y       - Image y coords.
     *      @param {number} obj.src     - Image source.
     *      @param {number} obj.width   - Image width.
     *      @param {number} obj.height  - Image height.
     * 
     * @returns The image added.
     */

    new(obj) {
        return new Promise(async (resolve, reject) => {

            obj.type = 'image';

            obj.onerror = (err) => { reject(err) };
            obj.onload  = (img) => {
                if (!image.properties.width && !image.properties.height) {
                    image.properties.width  = img.target.width;
                    image.properties.height = img.target.height;

                    /** 
                     * TO-DO: Change this later to have multiple origins. 
                     * Ex: middle right, left corner, etc.
                     */

                    image.properties.origin.x = image.properties.width/2;
                    image.properties.origin.y = image.properties.height/2;
                }

                // this.list.push(image);
                resolve(image);
            }

            const image = new Entity(obj);

        }).then( (image) => { return image }, (err) => { throw err });
    }

    /**
     * Delete image in the list.
     * @param {(object|number)} image - Image or number of image to delete.
     * 
     * @returns {(object|null)} Deleted image or null if can't find it.
     */

    delete(image) {

        if (typeof image == 'object' && image) {

            if (!image.constructor.name == 'Entity') {
                console.error(`${image} it's not an Entity.`);
                return null;
            }

            if (this.selected.has(image)) {
                this.deselect(image);               // Deselect.
            }

            return image.delete();

        } else if (typeof image == 'number' && this.list[image]) {

            if (!this.list[image].constructor.name == 'Entity') {
                console.error(`${this.list[image]} it's not an Entity.`);
                return null;
            }

            if (this.selected.has(this.list[image])) {
                this.deselect(this.list[image]);    // Deselect.
            }

            return this.list[image].delete();
        }

        console.error(`Undefined object.`);
        
        return null;

    }

    draw(ctx) {
        for (let image of this.list) {
            if (image.properties.visible) {
                ctx.drawImage(
                    image.img, 
                    image.pos.x - image.properties.origin.x, 
                    image.pos.y - image.properties.origin.y, 
                    image.properties.width, 
                    image.properties.height
                    );
            }
        }

        this.transform.draw(ctx);
    }

    select(image) {
        if (image && !this.selected.has(image)) {
            
            if (this.manipulator !== MANIPULATOR_TYPE.MOVE) {
                this.transform.img = image; // DEBUG
                this.transform.update();

                image.draggable = false;
            }

            this.selected.add(image);
        } else {
            return this.selected.clear();
        }
    }

    deselect(image) {

        this.transform.img = null; // DEBUG

        if (!image) { 
            if (this.manipulator !== MANIPULATOR_TYPE.MOVE) {
                this.selected.forEach((value) => {
                    value.draggable = true;
                });
            }

            return this.selected.clear();
        };

        if ( Array.isArray(image) ) {
            image.forEach( (value) => {
                if (this.manipulator !== MANIPULATOR_TYPE.MOVE) {
                    value.draggable = true;
                }

                this.selected.delete(value);
            });
            return this.selected;
        }

        if ( this.selected.has(image) ) {
            if (this.manipulator !== MANIPULATOR_TYPE.MOVE) {
                image.draggable = true;
            }

            return this.selected.delete(image);
        }
    }
}


/**
 * Image Resize
 */

class ImageTransform {
    constructor() {
        this.img = null;

        this.width  = 0;
        this.height = 0;

        this.pos = new V2(0, 0);

        this.boxes = {

            /**
             * Top.
             */

            topLeft:  new Entity({ type:'manipulation', width: 20, height: 20, originX: 10, originY: 10, draggable: true}),
            topMid:   new Entity({ type:'manipulation', width: 12, height: 12, originX: 6 , originY: 6 , draggable: true}),
            topRight: new Entity({ type:'manipulation', width: 20, height: 20, originX: 10, originY: 10, draggable: true}),

            /**
             * Middle.
             */

            midLeft:  new Entity({ type:'manipulation', width: 12, height: 12, originX: 6 , originY: 6 , draggable: true}),
            middle:   new Entity({ type:'manipulation', width: 20, height: 20, originX: 10, originY: 10, draggable: true}),
            midRight: new Entity({ type:'manipulation', width: 12, height: 12, originX: 6 , originY: 6 , draggable: true}),

            /**
             * Bottom.
             */

            botLeft:  new Entity({ type:'manipulation', width: 20, height: 20, originX: 10, originY: 10, draggable: true}),
            botMid:   new Entity({ type:'manipulation', width: 12, height: 12, originX: 6 , originY: 6 , draggable: true}),
            botRight: new Entity({ type:'manipulation', width: 20, height: 20, originX: 10, originY: 10, draggable: true}),
        };
    }

    update() {
        if (this.img) {

            this.pos    = new V2(this.img.pos.x, this.img.pos.y);
            this.width  = this.img.properties.width;
            this.height = this.img.properties.height;

            /**
             * Top.
             */

            this.boxes.topLeft.pos  = new V2(this.img.pos.x, this.img.pos.y)
                                            .sub(this.img.properties.origin);
            
            this.boxes.topMid.pos   = new V2(this.img.pos.x, this.img.pos.y)
                                            .sub(this.img.properties.origin)
                                            .add(this.img.properties.width/2, 0);

            this.boxes.topRight.pos = new V2(this.img.pos.x, this.img.pos.y)
                                            .sub(this.img.properties.origin)
                                            .add(this.img.properties.width, 0);

            /**
             * Middle.
             */

            this.boxes.midLeft.pos  = new V2(this.img.pos.x, this.img.pos.y)
                                            .sub(this.img.properties.origin)
                                            .add(0, this.img.properties.height / 2);
            
            this.boxes.middle.pos   = new V2(this.img.pos.x, this.img.pos.y)
                                            .sub(this.img.properties.origin)
                                            .add(this.img.properties.width/2, this.img.properties.height/2);

            this.boxes.midRight.pos = new V2(this.img.pos.x, this.img.pos.y)
                                            .sub(this.img.properties.origin)
                                            .add(this.img.properties.width, this.img.properties.height / 2);

            /**
             * Bottom.
             */

            this.boxes.botLeft.pos  = new V2(this.img.pos.x, this.img.pos.y)
                                            .sub(this.img.properties.origin)
                                            .add(0, this.img.properties.height);

            this.boxes.botMid.pos   = new V2(this.img.pos.x, this.img.pos.y)
                                            .sub(this.img.properties.origin)
                                            .add(this.img.properties.width/2, this.img.properties.height);

            this.boxes.botRight.pos = new V2(this.img.pos.x, this.img.pos.y)
                                            .sub(this.img.properties.origin)
                                            .add(this.img.properties.width, this.img.properties.height);
        }
    }

    draw(ctx) {
        if (this.img) {

            /**
             * Borders
             */
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.strokeRect(this.img.pos.x - this.img.properties.origin.x, this.img.pos.y - this.img.properties.origin.y, this.img.properties.width, this.img.properties.height);
            ctx.strokeStyle = '#6b6b6b';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.img.pos.x - this.img.properties.origin.x, this.img.pos.y - this.img.properties.origin.y, this.img.properties.width, this.img.properties.height);

            /**
             * Boxes
             */

            for (let box in this.boxes) {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(this.boxes[box].pos.x - this.boxes[box].properties.origin.x , this.boxes[box].pos.y - this.boxes[box].properties.origin.y , this.boxes[box].properties.width, this.boxes[box].properties.height);
                ctx.fillStyle = this.boxes[box].properties.color;
                ctx.fillRect(this.boxes[box].pos.x - this.boxes[box].properties.origin.x , this.boxes[box].pos.y - this.boxes[box].properties.origin.y , this.boxes[box].properties.width, this.boxes[box].properties.height);
            }
        }
    }
}