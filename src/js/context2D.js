/**
 * 
 */

export class Context2D {
    constructor(context) {
        this.context = context;
    }
    /**
     * 
     * @param {object} obj 
     *      @param {number} obj.x
     *      @param {number} obj.y 
     *      @param {number} obj.width
     *      @param {number} obj.height
     *      @param {number} obj.color
     *      @param {number} obj.alpha
     *      @param {number} obj.strokeColor
     * @param {boolean|string} outline "inside", "outside".
     * @param {boolean} fill
     */
    drawRectangle(obj, outline = false, fill = true) {
        if (obj.properties?.visible ?? true) {

            /**
             * Color.
             */

            obj.color       = obj.color       ?? obj.properties?.fillColor   ?? 'red';
            obj.strokeColor = obj.strokeColor ?? obj.properties?.strokeColor ?? obj.color;
            obj.lineWidth   = obj.lineWidth   ?? obj.properties?.lineWidth   ?? 0;
            obj.alpha       = obj.alpha       ?? obj.properties?.alpha       ?? 1;

            /**
             * Draw.
             */

            this.context.alpha = obj.alpha;

            if (obj.lineWidth && (outline === true || outline == 'outside')) {
                this.context.lineWidth   = obj.lineWidth;
                this.context.strokeStyle = obj.strokeColor;
                
                this.context.strokeRect( obj.pos.x - obj.properties?.origin.x, obj.pos.y - obj.properties?.origin.y, obj.properties?.width, obj.properties?.height );
            }

            if (fill) {
                this.context.fillStyle = obj.color;
                
                this.context.fillRect( obj.pos.x - obj.properties.origin.x, obj.pos.y - obj.properties.origin.y, obj.properties.width, obj.properties.height );
            }

            if (obj.lineWidth && (outline == 'inside')) {
                this.context.lineWidth   = obj.lineWidth;
                this.context.strokeStyle = obj.strokeColor;
                
                this.context.strokeRect( obj.pos.x - obj.properties?.origin.x, obj.pos.y - obj.properties?.origin.y, obj.properties?.width, obj.properties?.height );
            }

        }
    }

    drawImage(image) {
        this.context.drawImage(
            image.img, 
            image.pos.x - image.properties.origin.x, 
            image.pos.y - image.properties.origin.y, 
            image.properties.width, 
            image.properties.height
        );
    }
}