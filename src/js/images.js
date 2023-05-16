import { Entity } from './entity.js';

export class Images {
    constructor() {
        this.list        = [];
        this.selected    = new Set();
    }

    /**
     * Create a new image and add it to de list.
     * @param {Object} obj - Properies of the image 
     *      @param {number} obj.x - Image x coords.
     *      @param {number} obj.y - Image y coords.
     *      @param {number} obj.src - Image source.
     *      @param {number} obj.width - Image width.
     *      @param {number} obj.height - Image height.
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

                    /* TO-DO: Change this later to have multiple origins. Ex: middle right, left corner, etc.  */

                    image.properties.originX = image.properties.width/2;
                    image.properties.originY = image.properties.height/2;
                }

                this.list.push(image);
                resolve(image);
            }

            const image = new Entity(obj);

        }).then( (image) => { /* DEBUG */ console.log(image); return image }, (err) => { throw err });
    }

    /**
     * Delete image in the list.
     * @param {(Object|number)} image - Image or number of image to delete.
     * @returns {(Object|null)} Deleted image or null if can't find it.
     */

    delete(image) {
        
        if (typeof image == 'number') {

            /**
             * Delete by order in the list.
             */

            this.list[image].delete(image);     // Delete entity.
            return this.list.splice(image, 1);  // Remove reference.

        } else if (typeof image == 'object') {

            /**
             * Delete by object
             */

            for (let i = 0; i < this.list.length; i++) {
                if (this.list[i] == image) {
                    this.list[i].delete(i);         // Delete entity.
                    return this.list.splice(i, 1);  // Remove reverence.
                }
            }

            return null;

        }
    }

    draw(ctx) {
        for (let image of this.list) {
            ctx.drawImage(
                image.img, 
                image.pos.x - image.properties.originX, 
                image.pos.y - image.properties.originY, 
                image.properties.width, 
                image.properties.height
                );
        }
    }   
}


/**
 * Image Resize
 */

export class ImageResize {
    constructor(image) {
        this.img = image;

        /**
         * Bounding boxes.
         */

        this.bboxW = {
            left:   this.img.pos.x - this.img.properties.originX,
            right:  this.img.pos.x + this.img.properties.width  - this.img.properties.originX,
        };

        this.bboxH = {
            top:    this.img.pos.y - this.img.properties.originY,
            bottom: this.img.pos.y + this.img.properties.height - this.img.properties.originY,
        };

        /**
         * List of boxes to manipulate the image.
         */

        this.manipulation = [];

        for (let y in this.bboxH) {
            for (let x in this.bboxW) {
                this.manipulation.push(
                    new Entity({
                        name: new Set([y, x]),
                        type: 'manipulator',

                        x: this.bboxW[x],
                        y: this.bboxH[y],

                        width:  20,
                        height: 20,

                        originX: 10,
                        originY: 10,

                        onmove: (me) => {
                            for (let box of this.manipulation) {
                                if (box.name.has('top') && me.name.has('top') || box.name.has('bottom') && me.name.has('bottom') ) {
                                    box.pos.y = me.pos.y;
                                }

                                if (box.name.has('left') && me.name.has('left') || box.name.has('right') && me.name.has('right') ) {
                                    box.pos.x = me.pos.x;
                                }
                            }
                            
                            this.img.properties.width = this.manipulation[1].pos.x - this.manipulation[0].pos.x;
                            this.img.properties.height = this.manipulation[2].pos.y - this.manipulation[0].pos.y;
                        },
                    }
                ));
            }
        }

    }

    move(x = 0, y = 0) {
        for (let entity of this.manipulation) {
            entity.pos.x += x;
            entity.pos.y += y;
    
            if (entity.onmove) {
                entity.onmove(entity);
            }
        }
    }

    setPos(x, y) {
        for (let entity of this.manipulation) {
            entity.pos.x = x ?? entity.pos.x;
            entity.pos.y = y ?? entity.pos.y;

            if (entity.onmove) {
                entity.onmove(entity);
            }
        }
    }

    delete() {
        for (let entity of this.manipulation) {
            entity.delete();
        }
    }
}

/**
 * Types of image manipulation.
 */

const MANIPULATOR_TYPE = Object.freeze({
    // 'MOVE':      Symbol(),
    'TRANSFORM': Symbol(),
    'CROP':      Symbol(),
});

export class ImageManipulator {
    constructor() {

        /**
         * Type of image manipulation:
         *      MANIPULATOR_TYPE.MOVE, 
         *      MANIPULATOR_TYPE.TRANSFORM,
         *      MANIPULATOR_TYPE.CROP ...
         */

        this.type = MANIPULATOR_TYPE.TRANSFORM;

        this.selected = null;
    }

    /**
     * Select image.
     */

    select(image) {
        if (this.selected !== image) {

            this.deselect();

            this.selected = new ImageResize(image);

            return image;
        }

        return false;
    }

    /**
     * Deselect image.
     */

    deselect() {

        if (this.selected) {
            this.selected.delete();
        }

        return this.selected = null;
    }

    draw(ctx) {
        if (this.selected) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.strokeRect(this.selected.bboxW.left, this.selected.bboxH.top, this.selected.img.properties.width, this.selected.img.properties.height);
            ctx.strokeStyle = '#6b6b6b';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.selected.bboxW.left, this.selected.bboxH.top, this.selected.img.properties.width, this.selected.img.properties.height);

            this.selected.manipulation.forEach((box) => {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(box.pos.x - box.properties.originX , box.pos.y - box.properties.originY , box.properties.width, box.properties.height);
                ctx.fillStyle = '#6b6b6b';
                ctx.fillRect(box.pos.x - box.properties.originX , box.pos.y - box.properties.originY , box.properties.width, box.properties.height);
            })
        }
    }

    resize(width, height) {
        for (let image of this.selected.keys()) {
            image.properties.width = width;
            image.properties.height = height;
        }
    }
}