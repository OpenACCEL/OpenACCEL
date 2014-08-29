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
define(["View/Graphics/AbstractDescartesHandler", "Model/Analysis"],
    /** @lends View.Graphics */
    function(AbstractDescartesHandler, Analysis) {

        /**
         * @class
         * @classdesc The AnalysisDescartesHandler class handles the drawing of Analysis objects.
         */
        function AnalysisDescartesHandler(modelElement) {
            /**
             * The initial Analysis object this handler will be drawing.
             *
             * @type {Analysis}
             */
            this.modelElement = modelElement;
        }

        AnalysisDescartesHandler.prototype = new AbstractDescartesHandler();

        /**
         * Returns whether this handler is capable of drawing the given object.
         *
         * @param modelElement {Object} The object of which we want to know if it can be drawn.
         * @return {boolean} modelElement instance of Analysis
         */
        AnalysisDescartesHandler.prototype.canHandle = function(modelElement) {
            return modelElement instanceof Analysis;
        };

        /**
         * Returns a new instance of this object, accomodating for the given object.
         *
         * @param modelElement {Analysis} The object to be accomodated.
         * @return {AnalysisDescartesHandler} The handler assigned to draw modelElement.
         */
        AnalysisDescartesHandler.prototype.getInstance = function(modelElement) {
            return new AnalysisDescartesHandler(modelElement);
        };

        /**
         * Adds a new descartes object to the array of descartes objects to be drawn to.
         * This handler also includes a click callback.
         *
         * @param div {String} The div in the html file in which the new descartes object must draw.
         * @param width {float} The width in pixels over which the new descartes object must draw.
         * @param height {float} The height in pixels over which the new descartes object must draw.
         * @modifies descartesInstances {Array<descartes>} The new descartes object gets appended to this.
         */
        AnalysisDescartesHandler.prototype.addDescartes = function(div, width, height) {
            var click = this.clickCallback.bind(this);
            this.descartesInstances[div] = new descartes({
                dN: div,
                cW: width,
                cH: height,
                cB: click
            });

            this.descartesInstances[div].setUpGraph();
        };

        /**
         * The click callback to be used by descartes when the mouse is clicked over it.
         * This callback sets this.clickedIndividual to the Individual represented by the point closest to the click.
         * The distance used here is euclidean distance.
         *
         * @param x {float} The mouse position on the x axis, normalised to [0...1].
         * @param y {float} The mouse position on the y axis, normalised to [0...1].
         * @modifies this.clickedIndividual {Individual} Changed to the Individual closest to the click.
         */
        AnalysisDescartesHandler.prototype.clickCallback = function(x, y) {
            var point = this.mapPoint({
                'x': x * this.coordinateScale,
                'y': y * this.coordinateScale
            });

            this.drawInstances();
        };

        /**
         * Returns the descartes drawing of the Individuals in this.modelElement.population.
         * The individuals are here represented by their paretoHor and paretoVer quantities as positions
         * on the x and y axis, respectively. Any Individual in the pareto front has a different colour and
         * diameter from the Individuals outside of the pareto front. The point corresponding to
         * this.clickedIndividual is highlighted with yet another different colour.
         *
         * @return {Object[]} The descartes drawing based on this.modelElement.population.
         */
        AnalysisDescartesHandler.prototype.getDrawing = function() {
            var drawing = {
                grid: this.modelElement.grid,
                edges: {
                    thickness: 2
                }
            };

            return [drawing];
        };

        // Exports are needed, such that other modules may invoke methods from this module file.
        return AnalysisDescartesHandler;
    });