/**
 * 2D Vector
 */

export class V2 {

    /**
     * X and Y coords
     * @param {Number} x 
     * @param {Number} y 
     */

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add() {
        let x2 = 0,
            y2 = 0;

        if (typeof arguments[0] == 'number') {
            x2 = arguments[0];
            y2 = arguments[1] ?? arguments[0];
        } else if (typeof arguments[0] == 'object') {
            x2 = arguments[0].x;
            y2 = arguments[0].y;
        }
        
        return new V2(this.x + x2, this.y + y2);
    }

    sub() {
        let x2 = 0,
            y2 = 0;

        if (typeof arguments[0] == 'number') {
            x2 = arguments[0];
            y2 = arguments[1] ?? arguments[0];
        } else if (typeof arguments[0] == 'object') {
            x2 = arguments[0].x;
            y2 = arguments[0].y;
        }

        return new V2(this.x - x2, this.y - y2);
    }

    scale(scale) {
        return new V2(this.x * scale, this.y * scale);
    }

    dis(that) {
        const xDis = this.x - that.x;
        const yDis = this.y - that.y;

        return Math.sqrt((xDis * xDis) + (yDis * yDis)); 
    }
}
