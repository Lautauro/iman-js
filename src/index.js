'use strict';
import { ENTITIES } from "./js/entity.js";
import { Images, ImageManipulator } from "./js/images.js";
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

let windowResized = false;

/**
 * Step function.
 */

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
 * Functions section.
 */

/**
 * Select entity.
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {requestCallback|object} callback 
 * 
 * @callback requestCallback
 * @param {object} Entity
 */

function pointSelection(x, y, callback) {
    for (let i = ENTITIES.length - 1; i >= 0; i--) {
        if ( ENTITIES[i].checkPointCollision( x, y ) ) {

            if (!callback) { return ENTITIES[i] };

            return callback( ENTITIES[i] );
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

POINTER.on('move', (e) => {

    /**
     * Mouse hover.
     */

    POINTER.mouseHover = pointSelection(e.x, e.y);

    // console.log('Mousehover: ', POINTER.mousehover); // DEBUG

    if (POINTER.isDown(POINTER.BTN_LEFT)) {

        /**
         * Move entity with the mouse.
         */

        if (POINTER.clickedElement) {
            POINTER.clickedElement.move( e.x - POINTER.getMoveHistory(-2).x, e.y - POINTER.getMoveHistory(-2).y );
        }
    }
});

/**
 * Mouse down
 */

POINTER.on('down', (e) => {

    if (POINTER.isDown(POINTER.BTN_LEFT) && !POINTER.isDown(POINTER.BTN_MIDDLE)) {

        /**
         * Select entity on click.
         */

        POINTER.clickedElement = POINTER.mouseHover;

        // console.log('Clicked', POINTER.clickedElement); // DEBUG

        if (POINTER.clickedElement) {
            POINTER.clickedElement.onclick();

            /**
             * Select image in MANIPULATOR.
             */

            if (POINTER.clickedElement.type == 'image') {
                MANIPULATOR.select(POINTER.clickedElement);
            }
            
        } else {

            /**
             * Deselect image in MANIPULATOR.
             */

            MANIPULATOR.deselect();
        }

    } else if (POINTER.isDown(POINTER.BTN_MIDDLE)) {

        MANIPULATOR.deselect();

        /**
         * Create image
         */

        IMAGES.new( 
            { 
                src: 'images/centro.jpg', 
                x: e.x, 
                y: e.y,
            } );
    }
});    