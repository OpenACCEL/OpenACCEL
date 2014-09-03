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

            /**
             * The grid that will serve as a plot background.
             */
            this.grid = {
                majX: 5,
                minX: 21,
                grMajX: 'line',
                grMinX: 'line',
                majY: 5,
                minY: 21,
                grMajY: 'line',
                grMinY: 'line'
            };

            /**
             * whether getDrawing() should return a clamped plot.
             */
            this.bClamp = true;

            this.propagatables.push({
                name: "getAnalysis",
                func: this.getAnalysis.bind(this)
            });
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
         * @return The analysis model element.
         */
        AnalysisDescartesHandler.prototype.getAnalysis = function() {
            return this.modelElement;
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
         * Returns the descartes drawing of the of the comparison or contour between various quantities.
         *
         * @return {Object[]} The descartes drawing based on this.modelElement.population.
         */
        AnalysisDescartesHandler.prototype.getDrawing = function() {
            var analysis = this.getAnalysis();
            var data = analysis.compare("x", "y");
            var deltaRange = data.range.max - data.range.min;
            var deltaDomain = data.domain.max - data.domain.min;

            // In case of no clamping, we'll want to range as set by the user.
            var analysisRange = analysis.getRange();
            var analysisDeltaRange = analysisRange.max - analysisRange.min;

            // The points have to be modified such that they fit in a x: [0, 100], y: [0, 100] plot.
            for (var i = 0; i < data.points.length; i++) {
                if (this.bClamp) {
                    data.points[i].y = 100 * (data.points[i].y - data.range.min) / deltaRange;
                } else {
                    data.points[i].y = 100 * (data.points[i].y - analysisRange.min) / analysisDeltaRange;
                }

                data.points[i].x = 100 * (data.points[i].x - data.domain.min) / deltaDomain;
            }

            var drawing = {
                grid: this.grid,
                locations: {
                    data: data.points
                },
                edges: {
                    thickness: 2
                }
            };

            // If we're clamping, we should set the clamped range of the analysis model.
            if (this.bClamp) {
                analysis.setRange(data.range);
            }

            return [drawing];
        };

        // Exports are needed, such that other modules may invoke methods from this module file.
        return AnalysisDescartesHandler;
    });
