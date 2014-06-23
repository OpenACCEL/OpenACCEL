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
define(["view/graphics/abstractdescarteshandler", "view/graphics/zoomfitdescartesdecorator", "model/emo/geneticoptimisation", "model/emo/individual", "model/emo/cloneobject"],
    /* @lends View.Graphics */
    function(AbstractDescartesHandler, ZoomFitDecorator, GeneticOptimisation, Individual, CloneObject) {

        /**
         * @class GeneticOptimisationDescartesHandler
         * @classdesc The GeneticOptimisationDescartesHandler class handles the drawing of GeneticOptimisation objects.
         */
        function GeneticOptimisationDescartesHandler(modelElement) {
            /**
             * First we must reset propagatables, otherwise these are shared among all subclasses of AbstractFunctionPropagator.
             */
            this.propagatables = [];

            /**
             * The initial GeneticOptimisation object this handler will be drawing.
             *
             * @type {GeneticOptimisation}
             */
            this.modelElement = modelElement;

            /**
             * The decorator this needs to facilitate zoom fitting.
             *
             * @type {GeneticOptimisation}
             */
            this.decorator = new ZoomFitDecorator();

            /**
             * The default setting of zoom fitting, we zoomfit at all times.
             *
             * @type {GeneticOptimisation}
             */
            this.decorator.setAlwaysFit(true);

            /**
             * Propagate the draw function to (probably) the Canvas class.
             */
            this.propagatables.push({
                name: "draw",
                func: this.draw.bind(this)
            });

            /**
             * Propagate the getClickedIndividual function to (probably) the Canvas class.
             */
            this.propagatables.push({
                name: "getClickedIndividual",
                func: this.getClickedIndividual.bind(this)
            });

            /**
             * Propagate the resetCanvas function to (probably) the Canvas class.
             */
            this.propagatables.push({
                name: "resetCanvas",
                func: this.resetCanvas.bind(this)
            });

            /**
             * The Individual that was last clicked on.
             *
             * @type {Individual}
             */
            this.clickedIndividual = null;
        };


        GeneticOptimisationDescartesHandler.prototype = new AbstractDescartesHandler();

        /**
         * Returns whether this handler is capable of drawing the given object.
         *
         * @param modelElement {Object} The object of which we want to know if it can be drawn.
         * @return {boolean} modelElement instance of GeneticOptimisation
         */
        GeneticOptimisationDescartesHandler.prototype.canHandle = function(modelElement) {
            return modelElement instanceof GeneticOptimisation;
        };

        /**
         * Returns a new instance of this object, accomodating for the given object.
         *
         * @param modelElement {GeneticOptimisation} The object to be accomodated.
         * @return {GeneticOptimisationDescartesHandler} The handler assigned to draw modelElement.
         */
        GeneticOptimisationDescartesHandler.prototype.getInstance = function(modelElement) {
            return new GeneticOptimisationDescartesHandler(modelElement);
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
        GeneticOptimisationDescartesHandler.prototype.addDescartes = function(div, width, height) {
            var click = this.clickCallback.bind(this);
            this.descartesInstances.push(new descartes({
                dN: div,
                cW: width,
                cH: height,
                cB: click
            }));
            this.descartesInstances[this.descartesInstances.length - 1].setUpGraph();
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
        GeneticOptimisationDescartesHandler.prototype.clickCallback = function(x, y) {
            var horVerKeys = this.getHorVerKeys();
            var horKey = horVerKeys[0];
            var verKey = horVerKeys[1];

            var point = this.mapPoint({
                'x': x * this.coordinateScale,
                'y': y * this.coordinateScale
            });

            var population = this.modelElement.population;
            var currentIndividual;

            var closestDistance = Infinity;
            var currentHorDistance = Infinity;
            var currentVerDistance = Infinity;
            var currentSquareDistance = Infinity;

            for (var i = population.length - 1; i >= 0; i--) {
                currentIndividual = population[i];

                var currentHorDistance = currentIndividual.outputvector[horKey].value - point.x;
                var currentVerDistance = currentIndividual.outputvector[verKey].value - point.y;
                currentSquareDistance = currentHorDistance * currentHorDistance + currentVerDistance * currentVerDistance;

                if (closestDistance > currentSquareDistance) {
                    closestDistance = currentSquareDistance;
                    this.clickedIndividual = population[i];
                }
            }

            //Dereference clickedIndividual
            this.clickedIndividual = new CloneObject(this.clickedIndividual);
            this.draw();
        };

        /**
         * Returns the most recently clicked Individual, as determined according to this.clickCallBack.
         *
         * @return this.clickedIndividual {Individual}
         */
        GeneticOptimisationDescartesHandler.prototype.getClickedIndividual = function() {
            return this.clickedIndividual;
        };


        /**
         * Returns the quantities set as paretoHor and paretoVer.
         *
         * @return [horQuantity, verQuantity] {Array<Quantity>} Both quantities used for paretoHor and paretoVer:
         * The paretoHor quantity on index 0.
         * The paretoVer quantity on index 1.
         */
        GeneticOptimisationDescartesHandler.prototype.getHorVerQuantities = function() {
            var quantities = controller.getScript().getQuantities();
            var horQuantity;
            var verQuantity;

            for (var i in quantities) {
                if (quantities[i].pareto.isHorizontal) {
                    horQuantity = i;
                }
                if (quantities[i].pareto.isVertical) {
                    verQuantity = i;
                }
            }

            return [horQuantity, verQuantity];
        };


        /**
         * Returns the keys used in the output vectors of the Individuals of the GeneticOptimisation
         * that correspond to the quantities set as paretoHor and paretoVer.
         *
         * @return [horKey, verKey] {Array<float>} Both keys used in the output vectors:
         * The key used for the paretoHor quantity on index 0.
         * The key used for the paretoVer quantity on index 1.
         */
        GeneticOptimisationDescartesHandler.prototype.getHorVerKeys = function() {
            var horVerQuantities = this.getHorVerQuantities();

            var horKey = 0;
            var verKey = 0;
            var currentName;
            var population = this.modelElement.population;

            if (population.length > 0) {
                for (var j = population[0].outputvector.length - 1; j >= 0; j--) {
                    currentName = population[0].outputvector[j].name;
                    if (currentName == horVerQuantities[0]) {
                        horKey = j;
                    }
                    if (currentName == horVerQuantities[1]) {
                        verKey = j;
                    }
                }
            }
            return [horKey, verKey];
        };


        /**
         * Returns the descartes drawing of the Individuals in this.modelElement.population.
         * The individuals are here represented by their paretoHor and paretoVer quantities as positions
         * on the x and y axis, respectively. Any Individual in the pareto front has a different colour and
         * diameter from the Individuals outside of the pareto front. The point corresponding to
         * this.clickedIndividual is highlighted with yet another different colour.
         *
         * @return {Array<Array<Object>>} The descartes drawing based on this.modelElement.population.
         */
        GeneticOptimisationDescartesHandler.prototype.getDrawing = function() {
            var horVerKeys = this.getHorVerKeys();
            var horKey = horVerKeys[0];
            var verKey = horVerKeys[1];

            var population = this.modelElement.population;
            var inFront;
            var currentIndividual;

            var xCoords = [];
            var yCoords = [];
            var redVals = [];
            var greenVals = [];
            var blueVals = [];
            var diameters = [];

            for (var i = population.length - 1; i >= 0; i--) {
                currentIndividual = population[i];

                xCoords.push(currentIndividual.outputvector[horKey].value);
                yCoords.push(currentIndividual.outputvector[verKey].value);

                inFront = currentIndividual.inParetoFront;

                if (currentIndividual.equals(this.clickedIndividual)) {
                    redVals.push(255);
                    greenVals.push(255);
                    blueVals.push(255);
                } else {
                    if (inFront) {
                        redVals.push(255);
                        greenVals.push(0);
                        blueVals.push(0);
                    } else {
                        redVals.push(0);
                        greenVals.push(150);
                        blueVals.push(150);
                    }
                }
                if (inFront) {
                    diameters.push(2);
                } else {
                    diameters.push(1);
                }
            }

            var ctrl = {
                'plotType': 'bubble',
                'col_r': {
                    'mode': 'data',
                    'ref': 3
                },
                'col_g': {
                    'mode': 'data',
                    'ref': 4
                },
                'col_b': {
                    'mode': 'data',
                    'ref': 5
                },
                'diameter': {
                    'mode': 'data',
                    'ref': 6
                },
                'x': {
                    'mode': 'data',
                    'ref': 1
                },
                'y': {
                    'mode': 'data',
                    'ref': 2
                }
            };

            return [
                [ctrl, xCoords, yCoords, redVals, greenVals, blueVals, diameters]
            ];
        };

        // Exports are needed, such that other modules may invoke methods from this module file.
        return GeneticOptimisationDescartesHandler;
    });
