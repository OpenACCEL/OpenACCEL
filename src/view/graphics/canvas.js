/*
 * x
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
define(["view/graphics/descarteshandlerfactory", "view/graphics/abstractfunctionpropagator"], function(DescartesHandlerFactory, AbstractFunctionPropagator) {
    /**
     * @class DescartesHandlerFactory
     * @classdesc The DescartesHandlerFactory class provides DescartesHandlers to Canvases,
     * allowing them to correctly draw any supported model element.
     */
    function Canvas(modelElement, div, width, height, factory) {

        /**
         * The DescartesHandlers that can be provided by this class.
         *
         * @type {array<AbstractDescartesHandler>}
         */
        this.div = div;

        /**
         * The DescartesHandlers that can be provided by this class.
         *
         * @type {array<AbstractDescartesHandler>}
         */
        this.width = width;

        /**
         * The DescartesHandlers that can be provided by this class.
         *
         * @type {array<AbstractDescartesHandler>}
         */
        this.height = height;

        /**
         * The DescartesHandlers that can be provided by this class.
         *
         * @type {array<AbstractDescartesHandler>}
         */
        this.factory = factory;

        /**
         * The DescartesHandlers that can be provided by this class.
         *
         * @type {array<AbstractDescartesHandler>}
         */
        this.setModel(modelElement);
    }


    Canvas.prototype = new AbstractFunctionPropagator();

    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    Canvas.prototype.canDraw = function() {
        return this.handler != null;
    };

    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
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
    }

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Canvas;
});
