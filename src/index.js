'use strict';
import { ENTITIES } from "./js/entity.js";
import { Images, ImageManipulator, ImageResize } from "./js/images.js";
import { Pointer } from "./js/pointer.js";

/**
 * Setup canvas.
 */

const canvas = document.getElementById('canvas');
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;

const ctx = canvas.getContext('2d');    

/**
 * Modules
 */

export const IMAGES  = new Images();
export const MANIPULATOR  = new ImageManipulator();
export const POINTER = new Pointer(canvas);

/**
 * Step function.
 */

let windowResized = false;

function step() {
    if (windowResized) {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        windowResized = false;
    }

    /**
     * Updates
     */

    POINTER.update();

    /**
     * Background 
     */

    ctx.fillStyle = '#212121';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /**
     * Draw Images
     */

    IMAGES.draw(ctx);

    /**
     * Draw Manipulator
     */

    MANIPULATOR.draw(ctx);

    /**
     * Draw Interface
     */

    // TO-DO

    window.requestAnimationFrame(step); 
}

window.requestAnimationFrame(step);

/**
 * Functions
 */

/**
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {requestCallback|object} callback 
 * 
 * @callback requestCallback
 * @param {object} Entity
 */

function pointSelection(x, y, callback) {
    for (let i = ENTITIES.length -1; i >= 0; i--) {
        if (ENTITIES[i].checkPointCollision(x, y)) {
            if (!callback) { return ENTITIES[i] };

            return callback(ENTITIES[i]);
        }
    }

    if (!callback) { return null };
    return callback(null);
}

/**
 * Event Listeners
 */

window.addEventListener('resize', (e) => {
    windowResized = true;
});

/**
 * Pointer listener
 */

let pointSelected = null;

POINTER.on('move', (e) => {
    if (POINTER.isDown(0)) {

        /**
         * Move entity with the mouse.
         */

        if (pointSelected) {
            pointSelected.move( e.x - POINTER.getMoveHistory(-2).x, e.y - POINTER.getMoveHistory(-2).y );
        }
    }
});

POINTER.on('down', (e) => {
    if (POINTER.isDown(0) && !POINTER.isDown(1)) {
        pointSelection(e.x, e.y, (entity) => {
            if (entity) {

                console.log('Selected: ', entity);
                
                if (entity.onclick) {
                    entity.onclick();
                };

                if (entity.type == 'image') {
                    MANIPULATOR.select(entity);
                }
    
                pointSelected = entity;
                
                if (entity.type == 'manipulator') {
                    // TO-DO
                }

            } else {
                MANIPULATOR.deselect();
                pointSelected = null;
            }
        });
    } else if (POINTER.isDown(1)) {
        IMAGES.new( 
            { 
                src: 'images/centro.jpg', 
                x: e.x, 
                y: e.y,
            } );
    }
});    