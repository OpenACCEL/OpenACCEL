/*
 *
 * @author Leo van Gansewinkel
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
} else {
    require.config({
        baseUrl: "scripts"
    });
}
/*******************************************************************/

// If all requirements are loaded, we may create our 'class'.
define(["view/graphics/descarteshandlerfactory", "view/graphics/abstractfunctionpropagator"], /** @lends View.Graphics */ function(DescartesHandlerFactory, AbstractFunctionPropagator) {

    /**
     * @class
     * @classdesc The Canvas class forms an abstraction from the specific DescartesHandler classes.
     * All reachable functionality needed from the DescartesHandlers is propagated to this class, to be used top level.
     */
    function Canvas(modelElement, div, width, height, factory) {

        /**
         * The div in the html file in which this canvas is to be located.
         *
         * @type {String}
         */
        this.div = div;

        /**
         * The width of this canvas in pixels.
         *
         * @type {Number}
         */
        this.width = width;

        /**
         * The height of this canvas in pixels.
         *
         * @type {Number}
         */
        this.height = height;

        /**
         * The factory from which this canvas can get the right DescartesHandler for modelElement.
         *
         * @type {DescactesHandlerFactory}
         */
        this.factory = factory;

        /**
         * The DescartesHandler which draws modelElement for this canvas.
         *
         * @type {AbstractDescactesHandler}
         */
        this.handler = null;

        /**
         * Get an appropriate handler and set modelElement as its modelElement.
         */
        this.setModel(modelElement);
    }


    Canvas.prototype = new AbstractFunctionPropagator();

    /**
     * Returns whether this canvas can be drawn on by a DescartesHandler for the last modelElement that was set.
     *
     * @return {boolean} this.handler != null
     */
    Canvas.prototype.canDraw = function() {
        return this.handler != null;
    };

    /**
     * Sets the modelElement to be drawn on this canvas to modelElement.
     *
     * @param modelElement {Object} The new modelElement to be drawn on this canvas.
     * @modifies this.handler {AbstractDescartesHandler} The handler either gets replaced by a new handler that
     * can draw modelElement, or gets modelElement to be drawn if it already can do so.
     * @modifies this {Canvas} This canvas gets all the propagated functionality of its new handler
     * (see FunctionPropagator).
     */
    Canvas.prototype.setModel = function(modelElement) {
        if (this.handler == null) {
            this.handler = this.factory.getHandler(modelElement);
            this.handler.addDescartes(this.div, this.width, this.height);
        } else {
            if (this.handler.canHandle(modelElement)) {
                this.handler.setModel(modelElement);
            } else {
                this.handler.removeDescartes(this.div);
                this.handler = this.factory.getHandler(modelElement);
                this.handler.addDescartes(this.div, this.width, this.height);
            }
        }
        this.facadify();
    };

    Canvas.prototype.discard = function() {
        this.handler.removeDescartes(this.div);
    };

    /**
     * Empties the canvas of any drawings.
     *
     * @modifies this.handler {AbstractDescartesHandler} The handler of this canvas.
     */
    Canvas.prototype.clearCanvas = function() {
        if (this.handler) {
            this.handler.clearCanvas(this.div);
        }
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Canvas;
});
