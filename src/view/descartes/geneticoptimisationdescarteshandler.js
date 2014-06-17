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
define(["view/descartes/abstractdescarteshandler", "view/descartes/zoomfitdecorator", "model/emo/geneticoptimisation", "model/emo/individual", "model/emo/individual"],
    function(AbstractDescartesHandler, ZoomFitDecorator, GeneticOptimisation, Individual, Distance) {
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
                name: "getClickInfo",
                func: this.getClickInfo.bind(this)
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
        GeneticOptimisationDescartesHandler.prototype.clickCallback = function(x, y) {
            var point = this.mapPoint({
                'x': x,
                'y': y
            });
            var comparablePoint = [];
            comparablePoint.push({
                'value': point.x
            });
            comparablePoint.push({
                'value': point.y
            });
            var closestDistance = Infinity;
            var currentDistance = Infinity;
            for (var i = population.length - 1; i >= 0; i--) {
                currentDistance = Distance.prototype.euclidian(population[i].outputvector, comparablePoint);
                if (closestDistance > currentDistance) {
                    this.clickedIndividual = population[i];
                }
            }
            this.clickInfo = this.clickedIndividual.toString();
            this.draw();
        };

        /**
         * Returns whether the script can be compiled and executed.
         *
         * @return this.analyser.scriptComplete && this.quantities.length > 0
         */
        GeneticOptimisationDescartesHandler.prototype.getClickInfo = function(x, y) {
            return this.clickInfo;
        };


        /**
         * Returns whether the script can be compiled and executed.
         *
         * @return this.analyser.scriptComplete && this.quantities.length > 0
         */
        GeneticOptimisationDescartesHandler.prototype.getDrawing = function() {
            //PASTED FROM KEES!!!
            var population = this.modelElement.getPopulation();
            var xx = [];
            var yy = [];
            var rr = [];
            var gg = [];
            var bb = [];
            var dd = [];
            var xxP = [];
            var yyP = [];
            var rrP = [];
            var ggP = [];
            var bbP = [];
            var ddP = [];
            for (var i = population.length - 1; i >= 0; i--) {
                if (population[i].inParetoFront()) {
                    xxP.push(population[i].outputvector[0].value);
                    yyP.push(population[i].outputvector[1].value);
                } else {
                    xx.push(population[i].outputvector[0].value);
                    yy.push(population[i].outputvector[1].value);
                }
                if (population[i].inParetoFront()) {
                    if (population[i].equals(this.clickedIndividual)) {
                        rrP.push(255);
                        ggP.push(255);
                        bbP.push(255);
                    } else {
                        rrP.push(255);
                        ggP.push(0);
                        bbP.push(0);
                        ddP.push(2);
                    }
                } else {
                    if (population[i].equals(this.clickedIndividual)) {
                        rrP.push(255);
                        ggP.push(255);
                        bbP.push(255);
                        ddP.push(1);
                    } else {
                        rr.push(0);
                        gg.push(150);
                        bb.push(150);
                        dd.push(1);
                    }
                }
            }
            // we pass the number of points as a parameter to enforce descartes always to draw the full set. Otherwise,
            // we run the risk that if the nr of points increases (e.g. because the user requests more solutions),
            // descartes decides not to re-parse the control string, and therefore does not re-allocate the arrays of elements.
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
            var ctrlP = {
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
            return [[ctrl, xx, yy, rr, gg, bb, dd], [ctrlP, xxP, yyP, rrP, ggP, bbP, ddP]];
        };

        // Exports are needed, such that other modules may invoke methods from this module file.
        return GeneticOptimisationDescartesHandler;
    });
