'use strict';
import { ENTITIES } from "./js/entity.js";
import { Images, MANIPULATOR_TYPE } from "./js/images.js";
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
export const POINTER = new Pointer(canvas);

export const IMAGES_LIST = IMAGES.list; // DEBUG
export const ENTITIES_LIST = ENTITIES; // DEBUG

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

    let selection = null;

    for (let list of ENTITIES.values()) {
        for (let i = list.length - 1; i >= 0; i--) {
            if (list[i].checkPointCollision( x, y ) && list[i].properties.visible ) {
                selection = list[i];
                break;
            };
        }
    };

    if (!callback) { 
        return selection;
    } else {
        return callback(selection);
    };
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

    if (POINTER.isDown(POINTER.BTN_LEFT)) {

        /**
         * Move entity with the mouse.
         */

        if (POINTER.clickedElement && POINTER.clickedElement.draggable) {
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

        /**
         * Select image in MANIPULATOR.
         */

        if (POINTER.clickedElement?.type == 'image') {

            IMAGES.select(POINTER.clickedElement);
            
        }

        /**
         * Deselect image in MANIPULATOR.
         */

        if (!POINTER.clickedElement) {

            IMAGES.deselect();
        }

    } else if (POINTER.isDown(POINTER.BTN_MIDDLE)) {

        /**
             * Deselect image in MANIPULATOR.
             */

        IMAGES.deselect();

        /**
         * Create image
         */

        IMAGES.new( 
            { 
                src: 'images/centro.jpg', 
                x: e.x, 
                y: e.y,
                draggable: true,
            } );
    }
});

POINTER.on('click', (e) => {
    if (POINTER.clickedElement?.type == 'image') {
        IMAGES.manipulator = MANIPULATOR_TYPE.TRANSFORM;
    }
});

// DEBUG //

IMAGES.new( 
    {
        name: 'debug',
        src: 'images/centro.jpg', 
        x: canvas.width/2, 
        y: canvas.height/2,
        draggable: true,
        onMouseDown() {
            console.log('DOWN', this);
        },
        onMouseUp() {
            console.log('UP', this);
        },
        onMouseClick() {
            console.log('CLICK', this);
        },
        onMouseMove() {
            console.log('MOVING', this);
        },
    } );