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
define(["view/graphics/abstractdescarteshandler", "view/graphics/zoomfitdescartesdecorator", "model/emo/geneticoptimisation", "model/emo/individual"],
    function(AbstractDescartesHandler, ZoomFitDecorator, GeneticOptimisation, Individual) {
        /**
         * @class GeneticOptimisationDescartesHandler
         * @classdesc The GeneticOptimisationDescartesHandler class provides DescartesHandlers to DescartesCanvases,
         * allowing them to correctly draw any supported model element.
         */
        function GeneticOptimisationDescartesHandler(modelElement) {
            /**
             * The DescartesHandlers that can be provided by this class.
             *
             * @type {array<AbstractDescartesHandler>}
             */
            this.modelElement = modelElement;

            this.decorator = new ZoomFitDecorator();
            this.decorator.setAlwaysFit(true);

            this.propagatables.push({
                name: "draw",
                func: this.draw.bind(this)
            });

            this.propagatables.push({
                name: "getClickedIndividual",
                func: this.getClickedIndividual.bind(this)
            });

            this.propagatables.push({
                name: "resetCanvas",
                func: this.resetCanvas.bind(this)
            });

            this.clickedIndividual = null;
        };


        GeneticOptimisationDescartesHandler.prototype = new AbstractDescartesHandler();

        /**
         * Returns whether the script can be compiled and executed.
         *
         * @return this.analyser.scriptComplete && this.quantities.length > 0
         */
        GeneticOptimisationDescartesHandler.prototype.canHandle = function(modelElement) {
            return modelElement instanceof GeneticOptimisation;
        };


        /**
         * Returns whether the script can be compiled and executed.
         *
         * @return this.analyser.scriptComplete && this.quantities.length > 0
         */
        GeneticOptimisationDescartesHandler.prototype.getInstance = function(modelElement) {
            return new GeneticOptimisationDescartesHandler(modelElement);
        };


        /**
         * Returns whether the script can be compiled and executed.
         *
         * @return this.analyser.scriptComplete && this.quantities.length > 0
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
         * Returns whether the script can be compiled and executed.
         *
         * @return this.analyser.scriptComplete && this.quantities.length > 0
         */
        GeneticOptimisationDescartesHandler.prototype.getClickedIndividual = function() {
            return this.clickedIndividual;
        };


        /**
         * Returns whether the script can be compiled and executed.
         *
         * @return this.analyser.scriptComplete && this.quantities.length > 0
         */
        GeneticOptimisationDescartesHandler.prototype.getHorVerKeys = function() {
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

            var horKey = 0;
            var verKey = 0;
            var currentName;
            var population = this.modelElement.population;

            if (population.length > 0) {
                for (var j = population[0].outputvector.length - 1; j >= 0; j--) {
                    currentName = population[0].outputvector[j].name;
                    if (currentName == horQuantity) {
                        horKey = j;
                    }
                    if (currentName == verQuantity) {
                        verKey = j;
                    }
                }
            }
            return [horKey, verKey];
        };

        /**
         * Returns whether the script can be compiled and executed.
         *
         * @return this.analyser.scriptComplete && this.quantities.length > 0
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
            this.draw();
        };


        /**
         * Returns whether the script can be compiled and executed.
         *
         * @return this.analyser.scriptComplete && this.quantities.length > 0
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
