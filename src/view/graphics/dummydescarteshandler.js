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
define(["view/graphics/abstractdescarteshandler"], function(AbstractDescartesHandler) {
    /**
     * @class DummyDescartesHandler
     * @classdesc The DummyDescartesHandler class provides DescartesHandlers to Canvases,
     * allowing them to correctly draw any supported model element.
     */
    function DummyDescartesHandler(modelElement) {
        /**
         * The DescartesHandlers that can be provided by this class.
         *
         * @type {array<AbstractDescartesHandler>}
         */
        this.modelElement = modelElement;
    };


    DummyDescartesHandler.prototype = new AbstractDescartesHandler();

    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    DummyDescartesHandler.prototype.canHandle = function(modelElement) {
        return true;
    };


    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    DummyDescartesHandler.prototype.getInstance = function(modelElement) {
        return new DummyDescartesHandler(modelElement);
    };


    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    DummyDescartesHandler.prototype.addDescartes = function(div, width, height) {
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
    DummyDescartesHandler.prototype.getDrawing = function() {
        var plot = [];
        plot['plotType'] = 'bubble';
        plot['diameter'] = 10;
        plot['x'] = 50;
        plot['y'] = 50;
        return [[plot]]
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return DummyDescartesHandler;
});
