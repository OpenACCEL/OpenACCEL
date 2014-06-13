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
        console.log(this.modelElement)
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
        console.log(this)
        return this.modelElement.getPlot();
    };


    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    ScriptDescartesHandler.prototype.getDecoratedDrawing = function() {
        console.log(this);
        return this.decorate(this.getDrawing());
    };

    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    ScriptDescartesHandler.prototype.decorate = function(plot) {
        if (this.decorator != null) {
            plot = this.decorator.decorate(plot);
        }
        return plot;
    };


    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    ScriptDescartesHandler.prototype.draw = function() {
        var drawing = this.getDecoratedDrawing();
        for (i in this.descartesInstances) {
            this.descartesInstances[i].draw(drawing);
        }
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return ScriptDescartesHandler;
});
