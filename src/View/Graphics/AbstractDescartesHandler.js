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
define(["View/Graphics/AbstractDescartesDecorator"], /** @lends View.Graphics */ function(AbstractDescartesDecorator) {

    /**
     * @class
     * @classdesc The AbstractDescartesHandler provides the basic functionality for extensions
     * to draw specific objects with descartes.
     */
    function AbstractDescartesHandler() {

        /**
         * The descartes objects this handler sends its drawings to, corresponds to multiple canvases.
         *
         * @type {Descartes[]}
         */
        this.descartesInstances = {};

        /**
         * The error report of descartes.draw().
         *
         * @type {String}
         */
        this.drawReport = "";

        /**
         * The information stored by the last click event, can be used to show tags belonging to
         * drawn objects.
         *
         * @type {String}
         */
        this.clickInfo = "";
    }


    AbstractDescartesHandler.prototype = new AbstractDescartesDecorator();

    /**
     * Returns whether this handler is capable of drawing the given object.
     *
     * @param modelElement {Object} The object of which we want to know if it can be drawn.
     * @return {boolean} true if this handler can draw modelElement, false if not
     */
    AbstractDescartesHandler.prototype.canHandle = function(modelElement) {
        return false;
    };

    /**
     * Returns a new instance of this object, accomodating for the given object.
     *
     * @param modelElement {Object} The object to be accomodated.
     * @return {AbstractDescartesHandler} The handler assigned to draw modelElement.
     */
    AbstractDescartesHandler.prototype.getInstance = function(modelElement) {
        return new AbstractDescartesHandler(modelElement);
    };

    /**
     * Switches which object this handler accomodates, given that it can do so.
     *
     * @param modelElement {Object} The object to be accomodated.
     * @pre canHandle(modelElement), this handler can accomodate for modelElement
     * @post this.modelElement = modelElement, modelElement is now accomodated by this handler
     */
    AbstractDescartesHandler.prototype.setModel = function(modelElement) {
        if (this.canHandle(modelElement)) {
            this.modelElement = modelElement;
        }
    };

    /**
     * Adds a new descartes object to the array of descartes objects to be drawn to.
     *
     * @param div {String} The div in the html file in which the new descartes object must draw.
     * @param width {Number} The width in pixels over which the new descartes object must draw.
     * @param height {Number} The height in pixels over which the new descartes object must draw.
     * @modifies descartesInstances The new descartes object gets appended to this.
     */
    AbstractDescartesHandler.prototype.addDescartes = function(div, width, height) {
        this.descartesInstances[div] = new descartes({
            dN: div,
            cW: width,
            cH: height
        });

        this.descartesInstances[div].setUpGraph();
    };

    /**
     * The click callback to be used by descartes when the mouse is clicked over it.
     */
    AbstractDescartesHandler.prototype.clickCallback = function(x, y, b) {};

    /**
     * The move callback to be used by descartes when the mouse moves over it.
     */
    AbstractDescartesHandler.prototype.moveCallback = function(x, y) {};

    /**
     * Removes a descartes object from descartesInstances and erases its graph.
     *
     * @param div {String} The name of the div in which the desired descartes object is located.
     * @modifies descartesInstances {Array<descartes>}
     * @pre Exists_i[ i in descartesInstances : descartesInstances[i].divName == div]
     * @post !Exists_i[ i in descartesInstances : descartesInstances[i].divName == div]
     */
    AbstractDescartesHandler.prototype.removeDescartes = function(div) {
        if (this.descartesInstances[div]) {
            this.descartesInstances[div].eraseGraph();
            delete this.descartesInstances[div];
        }
    };

    /**
     * Returns the raw drawing made from the modelElement of this handler, according to this handler.
     *
     * @return {Object[]} The drawing to be drawn by descartes.
     */
    AbstractDescartesHandler.prototype.getDrawing = function() {
        return [];
    };

    /**
     * Returns the decorated drawing made from the modelElement of this handler, according to this handler
     * and its decorators.
     *
     * @return {Object[]} The drawing to be drawn by descartes.
     */
    AbstractDescartesHandler.prototype.getDecoratedDrawing = function() {
        return this.decorate(this.getDrawing());
    };

    /**
     * Sends getDecoratedDrawing() to all descartes objects in descartesInstances.
     *
     * @param {String[]} Optional array: Draw only the given divs (and thus canvasses).
     * @modifies ForAll_i[descartesInstances[i]] {descartes} Previous drawing is overwritten by getDecoratedDrawing().
     */
    AbstractDescartesHandler.prototype.drawInstances = function(divs) {
        var drawing = this.getDecoratedDrawing();

        // Only draw the given divs.
        if (divs) {
            for (var key in divs) {
                this.descartesInstances[divs[key]].draw(drawing);
            }
        }

        // If none given, draw them all.
        else {
            for (var i in this.descartesInstances) {
                this.descartesInstances[i].draw(drawing);
            }
        }
    };

    /**
     * Returns the drawReport of this handler.
     *
     * @return this.drawReport {String}
     */
    AbstractDescartesHandler.prototype.getDrawReport = function() {
        return this.drawReport;
    };

    /**
     * Returns the clickInfo of this handler.
     *
     * @return this.clickInfo {String}
     */

    AbstractDescartesHandler.prototype.getClickInfo = function() {
        return this.clickInfo;
    };

    /**
     * Forces all descartesInstances to redraw, emptying their buffers. This is needed to
     * not use old input artifacts for drawing.
     *
     * @param {String[]} Optional array: Clear only the given divs (and thus canvasses).
     * @modifies ForAll_i[descartesInstances[i]] {descartes} The descartes objects of which the buffers are emptied.
     */
    AbstractDescartesHandler.prototype.clearBuffers = function(divs) {
        // Only clear the given divs.
        if (divs) {
            for (var key in divs) {
                this.descartesInstances[divs[key]].enforceRedraw();
            }
        }

        // If none given, clear them all.
        else {
            for (var i in this.descartesInstances) {
                this.descartesInstances[i].enforceRedraw();
            }
        }
    };

    /**
     * Empties the canvas of any drawings.
     *
     * @modifies ForAll_i[descartesInstances[i]] {descartes} The descartes objects of which the canvas is cleared.
     */
    AbstractDescartesHandler.prototype.clearCanvas = function(divName) {
        for (var i in this.descartesInstances) {
            this.descartesInstances[i].whipeGraph(divName);
        }
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return AbstractDescartesHandler;
});
