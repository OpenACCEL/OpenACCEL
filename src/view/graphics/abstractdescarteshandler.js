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
define(["view/graphics/abstractdescartesdecorator"], function(AbstractDescartesDecorator) {
    /**
     * @class AbstractDescartesHandler
     * @classdesc The AbstractDescartesHandler class provides DescartesHandlers to Canvases,
     * allowing them to correctly draw any supported model element.
     */
    function AbstractDescartesHandler() {
        /**
         * The DescartesHandlers that can be provided by this class.
         *
         * @type {array<AbstractDescartesHandler>}
         */
        this.descartes = null;
        /**
         * The DescartesHandlers that can be provided by this class.
         *
         * @type {array<AbstractDescartesHandler>}
         */
        this.descartesInstances = [];
        /**
         * The DescartesHandlers that can be provided by this class.
         *
         * @type {array<AbstractDescartesHandler>}
         */
        this.drawReport = "";
        /**
         * The DescartesHandlers that can be provided by this class.
         *
         * @type {array<AbstractDescartesHandler>}
         */
        this.clickInfo = "";
    }


    AbstractDescartesHandler.prototype = new AbstractDescartesDecorator();

    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    AbstractDescartesHandler.prototype.canHandle = function(modelElement) {
        return false;
    };


    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    AbstractDescartesHandler.prototype.getInstance = function(modelElement) {
        return new AbstractDescartesHandler(modelElement);
    };


    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    AbstractDescartesHandler.prototype.setModel = function(modelElement) {
        if (this.canHandle(modelElement)) {
            this.modelElement = modelElement;
        }
    };


    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    AbstractDescartesHandler.prototype.addDescartes = function(div, width, height) {
        this.descartesInstances.push(new descartes({
            dN: div,
            cW: width,
            cH: height
        }));
        this.descartesInstances[this.descartesInstances.length - 1].setUpGraph();
    };


    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    AbstractDescartesHandler.prototype.removeDescartes = function(div) {
        for (i in this.descartesInstances) {
            if (this.descartesInstances[i].divName == this.div) {
                this.descartesInstances.splice(i, 1);
            }
        }
    };


    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    AbstractDescartesHandler.prototype.getDrawing = function() {
        return [];
    };


    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    AbstractDescartesHandler.prototype.getDecoratedDrawing = function() {
        return this.decorate(this.getDrawing());
    };


    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    AbstractDescartesHandler.prototype.draw = function() {
        var drawing = this.getDecoratedDrawing();
        for (i in this.descartesInstances) {
            this.descartesInstances[i].draw(drawing);
        }
    };


    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    AbstractDescartesHandler.prototype.getDrawReport = function() {
        return this.drawReport;
    };


    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    AbstractDescartesHandler.prototype.getClickInfo = function() {
        return this.clickInfo;
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return AbstractDescartesHandler;
});
