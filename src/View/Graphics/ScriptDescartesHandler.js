/*
 *
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
define(["View/Graphics/AbstractDescartesHandler", "Model/Script"], /** @lends View.Graphics */ function(AbstractDescartesHandler, Script) {

    /**
     * @class
     * @classdesc The ScriptDescartesHandler class handles the drawing of Script objects.
     */
    function ScriptDescartesHandler(modelElement) {
        /**
         * First we must reset propagatables, otherwise these are shared among all subclasses of AbstractFunctionPropagator.
         */
        this.propagatables = [];

        /**
         * The initial Script object this handler will be drawing.
         *
         * @type {Script}
         */
        this.modelElement = modelElement;

        /**
         * Propagate the draw function to (probably) the Canvas class.
         */
        this.propagatables.push({
            name: "draw",
            func: this.draw.bind(this)
        });

        /**
         * Propagate the clearBuffers function to (probably) the Canvas class.
         */
        this.propagatables.push({
            name: "clearBuffers",
            func: this.clearBuffers.bind(this)
        });
    }


    ScriptDescartesHandler.prototype = new AbstractDescartesHandler();

    /**
     * Returns whether this handler is capable of drawing the given object.
     *
     * @param modelElement {Object} The object of which we want to know if it can be drawn.
     * @return {boolean} instance of Script
     */
    ScriptDescartesHandler.prototype.canHandle = function(modelElement) {
        return modelElement instanceof Script;
    };

    /**
     * Returns a new instance of this object, accomodating for the given object.
     *
     * @param modelElement {Script} The object to be accomodated.
     * @return {ScriptDescartesHandler} The handler assigned to draw modelElement.
     */
    ScriptDescartesHandler.prototype.getInstance = function(modelElement) {
        return new ScriptDescartesHandler(modelElement);
    };

    /**
     * Adds a new descartes object to the array of descartes objects to be drawn to.
     * This handler also includes a click callback and a move callback.
     *
     * @param div {String} The div in the html file in which the new descartes object must draw.
     * @param width {Number} The width in pixels over which the new descartes object must draw.
     * @param height {Number} The height in pixels over which the new descartes object must draw.
     * @modifies descartesInstances {Array<descartes>} The new descartes object gets appended to this.
     */
    ScriptDescartesHandler.prototype.addDescartes = function(div, width, height) {
        var click = this.clickCallback.bind(this);
        var move = this.moveCallback.bind(this);
        this.descartesInstances[div] = new descartes({
            dN: div,
            cW: width,
            cH: height,
            cB: click,
            cMove: move
        });

        this.descartesInstances[div].setUpGraph();
    };

    /**
     * The click callback to be used by descartes when the mouse is clicked over it.
     *
     * @param x {Number} The mouse position on the x axis, normalised to [0...1].
     * @param y {Number} The mouse position on the y axis, normalised to [0...1].
     * @param b {boolean} The mousebutton status.
     * @modifies modelElement.exe.mouseX {Number} The mouse position on the x axis is set to x * 100.
     * @modifies modelElement.exe.mouseY {Number} The mouse position on the y axis is set to y * 100.
     * @modifies modelElement.exe.mouseB {boolean} The mousebutton status is set to b.
     */
    ScriptDescartesHandler.prototype.clickCallback = function(x, y, b) {
        controller.setMousePosInScript(x * this.coordinateScale, y * this.coordinateScale);
        controller.setMouseButtonInScript(b);
    };

    /**
     * The move callback to be used by descartes when the mouse moves over it.
     *
     * @param x {Number} The mouse position on the x axis, normalised to [0...1].
     * @param y {Number} The mouse position on the y axis, normalised to [0...1].
     * @modifies modelElement.exe.mouseX {Number} The mouse position on the x axis is set to x * 100.
     * @modifies modelElement.exe.mouseY {Number} The mouse position on the y axis is set to y * 100.
     */
    ScriptDescartesHandler.prototype.moveCallback = function(x, y) {
        controller.setMousePosInScript(x * this.coordinateScale, y * this.coordinateScale);
    };

    /**
     * Returns the raw drawing made from the modelElement of this handler, according to this handler.
     *
     * @return {Array<Array<Object>>} The plot variable found in the exe of the script, modelElement.exe.plot().
     */
    ScriptDescartesHandler.prototype.getDrawing = function() {
        return this.modelElement.getPlot();
    };

    /**
     * Sends getDecoratedDrawing() to all descartes objects in descartesInstances.
     * In addition, the statusreport from descartes is fetched and propagated to be thrown as error if needed.
     *
     * @modifies ForAll_i[descartesInstances[i]] {descartes} Previous drawing is overwritten by getDecoratedDrawing().
     * @modifies this.modelElement {Script} The script gets its plotStatus changed.
     */
    ScriptDescartesHandler.prototype.draw = function() {
        var drawing = this.getDecoratedDrawing();
        var status = '';
        for (var div in this.descartesInstances) {
            this.descartesInstances[div].draw(drawing);
            status = this.descartesInstances[div].getStatusReport();
        }
        this.drawReport = status;
        controller.setPlotStatusInScript(this.drawReport);
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return ScriptDescartesHandler;
});
