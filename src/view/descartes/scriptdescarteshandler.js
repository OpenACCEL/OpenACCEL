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
define(["view/descartes/abstractdescarteshandler", "model/script"], function(AbstractDescartesHandler, Script) {
    /**
     * @class ScriptDescartesHandler
     * @classdesc The ScriptDescartesHandler class provides DescartesHandlers to DescartesCanvases,
     * allowing them to correctly draw any supported model element.
     */
    function ScriptDescartesHandler(modelElement) {
        /**
         * The DescartesHandlers that can be provided by this class.
         *
         * @type {array<AbstractDescartesHandler>}
         */
        this.modelElement = modelElement;

        this.propagatables.push({
            name: "draw",
            func: this.draw.bind(this)
        });
    };


    ScriptDescartesHandler.prototype = new AbstractDescartesHandler();

    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    ScriptDescartesHandler.prototype.canHandle = function(modelElement) {
        return modelElement instanceof Script;
    };


    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    ScriptDescartesHandler.prototype.getInstance = function(modelElement) {
        return new ScriptDescartesHandler(modelElement);
    };


    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    ScriptDescartesHandler.prototype.addDescartes = function(div, width, height) {
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
    ScriptDescartesHandler.prototype.clickCallback = function(x, y) {

    };


    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    ScriptDescartesHandler.prototype.getDrawing = function() {
        return this.modelElement.getPlot();
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return ScriptDescartesHandler;
});
