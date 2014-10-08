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
define(["lodash", "View/Graphics/AbstractDescartesHandler", "Model/Analysis"],
    /** @lends View.Graphics */
    function(_, AbstractDescartesHandler, Analysis) {

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
             * A graph that shows an error message at the center.
             */
            this.errorGraph = {
                'background': {
                    'fcol_a': 1,
                    'fcol_r': 153,
                    'fcol_g':51,
                    'fcol_b':204
                },
                'locations': {
                    'x': 50,
                    'y': 50,
                    'tag': '',
                    'pointSize': 4,
                    'tcol_r': 255,
                    'tcol_g': 255,
                    'tcol_b': 255
                }
            };

            /**
             * Whether getDrawing() should return a clamped plot.
             */
            this.bClamp = true;

            /**
             * When clamping is enabled, the margin make ssure that there's
             * a small border around the actual graph, such that it's not
             * entirely stuck to the canvas borders.
             */
            this.clampMargin = 4;

            /**
             * Whether the descartes handler should draw a normal line graph, or contour plot.
             */
            this.mode = "graph";

            /**
             * The amount of contours to plot, when plotting contour lines.
             *
             * @type {Number}
             */
            this.nrContours = 10;

            this.propagatables.push({
                name: "getAnalysis",
                func: this.getAnalysis.bind(this)
            });

            this.propagatables.push({
                name: "setPlotType",
                func: this.setPlotType.bind(this)
            });

            this.propagatables.push({
                name: "setNrContours",
                func: this.setNrContours.bind(this)
            });

            this.propagatables.push({
                name: "getError",
                func: this.getError.bind(this)
            });

            this.propagatables.push({
                name: "setError",
                func: this.setError.bind(this)
            });

            this.propagatables.push({
                name: "clearError",
                func: this.clearError.bind(this)
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
         * Handles the switching between different kind of plot types.
         * Supported types are 'line' and 'contour'.
         */
        AnalysisDescartesHandler.prototype.setPlotType = function(type) {
            this.mode = type;
        };

        /**
         * Handles the switching between different kind of plot types.
         * Supported types are 'line' and 'contour'.
         */
        AnalysisDescartesHandler.prototype.setNrContours = function(nr) {
            if (nr < 0 || nr == Infinity) {
                this.nrContours = 10;
            }
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
         *
         * @param x {float} The mouse position on the x axis, normalised to [0...1].
         * @param y {float} The mouse position on the y axis, normalised to [0...1].
         */
        AnalysisDescartesHandler.prototype.clickCallback = function(x, y) {
            var point = this.mapPoint({
                'x': x * this.coordinateScale,
                'y': y * this.coordinateScale
            });

            this.drawInstances();
        };

        /**
         * @return The error message of the graph if present. Empty string if
         *         no error is present.
         */
        AnalysisDescartesHandler.prototype.getError = function() {
            return this.errorGraph.locations.tag;
        };

        /**
         * Make the plot show an error message.
         *
         * @param {String} error The error message to show.
         */
        AnalysisDescartesHandler.prototype.setError = function(error) {
            this.errorGraph.locations.tag = error;
        };

        /**
         * Clears any error from the graph.
         */
        AnalysisDescartesHandler.prototype.clearError = function() {
            this.setError("");
        };

        /**
         * Returns the descartes drawing of the of the comparison or contour between various quantities.
         *
         * @return {Object[]} The descartes drawing based on this.modelElement.population.
         */
        AnalysisDescartesHandler.prototype.getDrawing = function() {
            // Before we do anything, check for an error message and show that instead.
            if (!_.isEmpty(this.getError())) {
                return [this.errorGraph];
            }

            switch (this.mode) {
                case "contour":
                    return this.getContourDrawing();
                default:
                    return this.getGraphDrawing();
            }
        };

        /**
         * @return Drawing of a normal line plot between two quantities.
         */
        AnalysisDescartesHandler.prototype.getGraphDrawing = function() {
            var analysis = this.getAnalysis();
            var data = analysis.compare2D();

            // Before we do anything, we must make sure the range is an actual interval.
            // In the case of a constant line, we will just add a small offset ourself.
            if (data.range.min == data.range.max) {
                data.range.min -= 1;
                data.range.max += 1;
                analysis.setRange(data.range);
            }

            var deltaRange = data.range.max - data.range.min;
            var deltaDomain = data.domain.max - data.domain.min;

            // In case of no clamping, we'll want to range as set by the user.
            var analysisRange = analysis.getRange();
            var analysisDeltaRange = analysisRange.max - analysisRange.min;

            // The points have to be modified such that they fit in a x: [0, 100], y: [0, 100] plot.
            for (var i = 0; i < data.points.length; i++) {
                if (this.bClamp) {
                    data.points[i].y = (100 - this.clampMargin) * (data.points[i].y - data.range.min) / deltaRange + this.clampMargin / 2;
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
                var margin = 1 / (1 - this.clampMargin / 100);
                data.range.min *= margin;
                data.range.max *= margin;
                analysis.setRange(data.range);
            }

            return [drawing];
        };

        /**
         * @return Drawing of a contour plot between three quantities.
         */
        AnalysisDescartesHandler.prototype.getContourDrawing = function() {
            var analysis = this.getAnalysis();
            var data = analysis.compare3D();

            var drawing = {
                grid: this.grid,
                contour: {
                    nrContours: this.nrContours,
                    map: data.points,
                    iso: {
                        mode: "intp",
                        low: data.range.min,
                        high: data.range.max
                    },
                    col_r: {
                        mode: "intp",
                        low: 0,
                        high: 255
                    }
                }
            };

            analysis.setRange(data.range);
            return [drawing];
        };

        // Exports are needed, such that other modules may invoke methods from this module file.
        return AnalysisDescartesHandler;
    });
