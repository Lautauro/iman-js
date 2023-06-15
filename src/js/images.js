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

        this.manipulator = MANIPULATOR_TYPE.TRANSFORM;

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

                    image.properties.origin.x = obj.originX ?? image.properties.width/2;
                    image.properties.origin.y = obj.originY ?? image.properties.height/2;
                }

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
                ctx.drawImage(image);
            }
        }

        this.transform.draw(ctx);
    }

    select(image) {
        if (image && !this.selected.has(image)) {
            
            if (this.manipulator !== MANIPULATOR_TYPE.MOVE) {
                this.transform.img = image; // DEBUG
                this.transform.select(image);
            }

            this.selected.add(image);
        } else {
            this.transform.update();

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

            this.transform.update();

            return this.selected.clear();
        };

        if ( Array.isArray(image) ) {
            image.forEach( (value) => {
                if (this.manipulator !== MANIPULATOR_TYPE.MOVE) {
                    value.draggable = true;
                }

                this.selected.delete(value);
            });

            this.transform.select(image);

            return this.selected;
        }

        if ( this.selected.has(image) ) {
            if (this.manipulator !== MANIPULATOR_TYPE.MOVE) {
                image.draggable = true;
            }

            this.transform.select(image);

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

        this.interactive    = false;
        this.visible        = false;

        this.pos = new V2(0, 0);

        this.boxes = {

            /**
             * Pivot
             */

            pivot:      new Entity({ name: 'pivot', parent: this, type:'manipulation', width: 30, height: 30, originX: 15, originY: 15, draggable: false, fillColor: 'red'}),

            /**
             * Top.
             */

            topLeft:    new Entity({ name: 'topLeft', parent:  this, type:'manipulation', width: 20, height: 20, originX: 10, originY: 10, draggable: true, 
                            onMouseDown() {

                                /**
                                 * Save previous values
                                 */

                                this.previousPos = new V2(this.pos.x, this.pos.y);

                                /**
                                 * Parent history.
                                 */

                                this.parent.previousPos     = this.parent.img.pos;
                                this.parent.previousWidth   = this.parent.img.properties.width;
                                this.parent.previousHeight  = this.parent.img.properties.height;
                                this.parent.previousOrigin  = this.parent.img.properties.origin; // Unused.
                            },

                            onMouseMove() {

                                /**
                                 * This counts how many pixels the box moves.
                                 */

                                const scale = this.pos.sub(this.previousPos);

                                /**
                                 * Scale the image.
                                 */

                                this.parent.img.properties.width  = this.parent.previousWidth  - scale.x;
                                this.parent.img.properties.height = this.parent.previousHeight - scale.y;

                                this.parent.img.pos = this.parent.previousPos.add(scale);

                                /**
                                 * Update the boxes positions.
                                 */

                                this.parent.update();
                            },
                        }),
            topMid:     new Entity({ name: 'topMid', parent:   this, type:'manipulation', width: 12, height: 12, originX: 6 , originY: 6 , draggable: true,
                            onMouseDown() {

                                /**
                                 * Save previous values
                                 */

                                this.previousPos = new V2(this.pos.x, this.pos.y);

                                /**
                                 * Parent history.
                                 */

                                this.parent.previousPos     = this.parent.img.pos;
                                this.parent.previousWidth   = this.parent.img.properties.width;
                                this.parent.previousHeight  = this.parent.img.properties.height;
                                this.parent.previousOrigin  = this.parent.img.properties.origin; // Unused.
                            },

                            onMouseMove() {

                                /**
                                 * This counts how many pixels the box moves.
                                 */

                                const scale = this.pos.sub(this.previousPos);

                                /**
                                 * Scale the image.
                                 */

                                this.parent.img.properties.height = this.parent.previousHeight - scale.y;

                                this.parent.img.pos = this.parent.previousPos.add(0, scale.y);

                                /**
                                 * Update the boxes positions.
                                 */

                                this.parent.update();
                            },
                        }),
            topRight:   new Entity({ name: 'topRight', parent: this, type:'manipulation', width: 20, height: 20, originX: 10, originY: 10, draggable: true,
                            onMouseDown() {

                                /**
                                 * Save previous values
                                 */

                                this.previousPos = new V2(this.pos.x, this.pos.y);

                                /**
                                 * Parent history.
                                 */

                                this.parent.previousPos     = this.parent.img.pos;
                                this.parent.previousWidth   = this.parent.img.properties.width;
                                this.parent.previousHeight  = this.parent.img.properties.height;
                                this.parent.previousOrigin  = this.parent.img.properties.origin; // Unused.
                            },

                            onMouseMove() {

                                /**
                                 * This counts how many pixels the box moves.
                                 */

                                const scale = this.pos.sub(this.previousPos);
                                console.log(scale);

                                /**
                                 * Scale the image.
                                 */

                                this.parent.img.properties.width  = this.parent.previousWidth  + scale.x;
                                this.parent.img.properties.height = this.parent.previousHeight - scale.y;

                                this.parent.img.pos = this.parent.previousPos.add(0, scale.y);

                                /**
                                 * Update the boxes positions.
                                 */

                                this.parent.update();
                            },
                        }),

            /**
             * Middle.
             */

            midLeft:    new Entity({ name: 'midLeft', parent:  this, type:'manipulation', width: 12, height: 12, originX: 6 , originY: 6 , draggable: true,
                            onMouseDown() {

                                /**
                                 * Save previous values
                                 */

                                this.previousPos = new V2(this.pos.x, this.pos.y);

                                /**
                                 * Parent history.
                                 */

                                this.parent.previousPos     = this.parent.img.pos;
                                this.parent.previousWidth   = this.parent.img.properties.width;
                                this.parent.previousHeight  = this.parent.img.properties.height;
                                this.parent.previousOrigin  = this.parent.img.properties.origin; // Unused.
                            },

                            onMouseMove() {

                                /**
                                 * This counts how many pixels the box moves.
                                 */

                                const scale = this.pos.sub(this.previousPos);

                                /**
                                 * Scale the image.
                                 */

                                this.parent.img.properties.width = this.parent.previousWidth - scale.x;

                                this.parent.img.pos = this.parent.previousPos.add(scale.x, 0);

                                /**
                                 * Update the boxes positions.
                                 */

                                this.parent.update();
                            },
                        }),
            middle:     new Entity({ name: 'midMid', parent:   this, type:'manipulation', width: 20, height: 20, originX: 10, originY: 10, draggable: true}),
            midRight:   new Entity({ name: 'midRight', parent: this, type:'manipulation', width: 12, height: 12, originX: 6 , originY: 6 , draggable: true,
                            onMouseDown() {

                                /**
                                 * Save previous values
                                 */

                                this.previousPos = new V2(this.pos.x, this.pos.y);

                                /**
                                 * Parent history.
                                 */

                                this.parent.previousPos     = this.parent.img.pos;
                                this.parent.previousWidth   = this.parent.img.properties.width;
                                this.parent.previousHeight  = this.parent.img.properties.height;
                                this.parent.previousOrigin  = this.parent.img.properties.origin; // Unused.
                            },

                            onMouseMove() {

                                /**
                                 * This counts how many pixels the box moves.
                                 */

                                const scale = this.pos.sub(this.previousPos);

                                /**
                                 * Scale the image.
                                 */

                                this.parent.img.properties.width = this.parent.previousWidth + scale.x;

                                // this.parent.img.pos = this.parent.previousPos.add(0, 0);

                                /**
                                 * Update the boxes positions.
                                 */

                                this.parent.update();
                            },
                        }),

            /**
             * Bottom.
             */

            botLeft:    new Entity({ name: 'botLeft', parent:  this, type:'manipulation', width: 20, height: 20, originX: 10, originY: 10, draggable: true,
                            onMouseDown() {

                                /**
                                 * Save previous values
                                 */

                                this.previousPos = new V2(this.pos.x, this.pos.y);

                                /**
                                 * Parent history.
                                 */

                                this.parent.previousPos     = this.parent.img.pos;
                                this.parent.previousWidth   = this.parent.img.properties.width;
                                this.parent.previousHeight  = this.parent.img.properties.height;
                                this.parent.previousOrigin  = this.parent.img.properties.origin; // Unused.
                            },

                            onMouseMove() {

                                /**
                                 * This counts how many pixels the box moves.
                                 */

                                const scale = this.pos.sub(this.previousPos);

                                /**
                                 * Scale the image.
                                 */

                                this.parent.img.properties.width  = this.parent.previousWidth  - scale.x;
                                this.parent.img.properties.height = this.parent.previousHeight + scale.y;

                                this.parent.img.pos = this.parent.previousPos.add(scale.x, 0);

                                /**
                                 * Update the boxes positions.
                                 */

                                this.parent.update();
                            },
                        }),
            botMid:     new Entity({ name: 'botMid', parent:   this, type:'manipulation', width: 12, height: 12, originX: 6 , originY: 6 , draggable: true,
                            onMouseDown() {

                                /**
                                 * Save previous values
                                 */

                                this.previousPos = new V2(this.pos.x, this.pos.y);

                                /**
                                 * Parent history.
                                 */

                                this.parent.previousPos     = this.parent.img.pos;
                                this.parent.previousWidth   = this.parent.img.properties.width;
                                this.parent.previousHeight  = this.parent.img.properties.height;
                                this.parent.previousOrigin  = this.parent.img.properties.origin; // Unused.
                            },

                            onMouseMove() {

                                /**
                                 * This counts how many pixels the box moves.
                                 */

                                const scale = this.pos.sub(this.previousPos);

                                /**
                                 * Scale the image.
                                 */

                                this.parent.img.properties.height = this.parent.previousHeight + scale.y;

                                // this.parent.img.pos = this.parent.previousPos.add(0);

                                /**
                                 * Update the boxes positions.
                                 */

                                this.parent.update();
                            },
                        }),
            botRight:   new Entity({ name: 'botRight', parent: this, type:'manipulation', width: 20, height: 20, originX: 10, originY: 10, draggable: true,
                            onMouseDown() {

                                /**
                                 * Save previous values
                                 */

                                this.previousPos = new V2(this.pos.x, this.pos.y);

                                /**
                                 * Parent history.
                                 */

                                this.parent.previousPos     = this.parent.img.pos;
                                this.parent.previousWidth   = this.parent.img.properties.width;
                                this.parent.previousHeight  = this.parent.img.properties.height;
                                this.parent.previousOrigin  = this.parent.img.properties.origin; // Unused.
                            },

                            onMouseMove() {

                                /**
                                 * This counts how many pixels the box moves.
                                 */

                                const scale = this.pos.sub(this.previousPos);

                                /**
                                 * Scale the image.
                                 */

                                this.parent.img.properties.width  = this.parent.previousWidth  + scale.x;
                                this.parent.img.properties.height = this.parent.previousHeight + scale.y;

                                // this.parent.img.pos = this.parent.previousPos.add(0);

                                /**
                                 * Update the boxes positions.
                                 */

                                this.parent.update();
                            },
                        }),
        };

        /**
         * History
         */

        this.previousImg    = null;
        this.previousWidth  = null;
        this.previousHeight = null;
        this.previousPos    = null;
        this.previousOrigin = null;
    }

    update() {
        if (this.img) {

            /**
             * Unhide boxes.
             */

            if (!this.interactive) {
                this.visible = true;
                this.interactive = true;

                for (let box in this.boxes) {
                    this.boxes[box].interactive         = true;
                    this.boxes[box].properties.visible  = true;
                }
            }

            /**
             * Set the same position of the image.
             */

            this.pos    = new V2(this.img.pos.x, this.img.pos.y);
            this.width  = this.img.properties.width;
            this.height = this.img.properties.height;

            /**
             * Pivot
             */

            this.boxes.pivot.pos   = new V2(this.img.pos.x, this.img.pos.y);

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
        } else {

            /**
             * Hide boxes.
             */

            this.visible        = false;
            this.interactive    = false;

            for (let box in this.boxes) {
                this.boxes[box].interactive = false;
                this.boxes[box].properties.visible = false;
            }
        }
    }

    select(img) {

        if (this.img) {
            this.previousImg = this.img;
        }

        this.img = img;

        /**
         * Update manipulator position when the image is moved.
         */

        this.img.onMouseMove = () => { this.update() };
        this.update();
    }

    draw(ctx) {
        if (this.img) {

            /**
             * Borders
             */

            ctx.drawRectangle(Object.assign({strokeColor: '#ffffff', lineWidth: 4}, this.img), true, false);
            ctx.drawRectangle(Object.assign({strokeColor: '#6b6b6b', lineWidth: 2}, this.img), true, false);

            /**
             * Boxes
             */

            for (let box in this.boxes) {
                if (this.boxes[box].properties.visible) {   
                    ctx.drawRectangle(Object.assign({ strokeColor: '#ffffff', lineWidth: 2 }, this.boxes[box]), 'inside', true);
                }
            }
        }
    }
}