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
define(["view/graphics/zoomfitdescartesdecorator", "view/graphics/pandescartesdecorator"],
    /** @lends View.Graphics */
    function(ZoomFitDescartesDecorator, PanDescartesDecorator) {

        /**
         * @class
         * @classdesc The QuarterFitDescartesDecorator decorates descartes drawings by zooming and panning
         * as to fit all drawing elements in the canvas with some margin or with some margin in one of the quarters of the canvas.
         */
        function QuarterFitDescartesDecorator() {

            /**
             * First we must reset propagatables, otherwise these are shared among all subclasses of AbstractFunctionPropagator.
             */
            this.propagatables = [];

            /**
             * The decorator components this composite decorator borrows functionality from.
             * Must be reset to prevent mixing with the super class.
             *
             * @type {AbstractDescartesDecorator[]}
             */
            this.decoratorComponents = [];

            /**
             * The quarter in which we position the zoomfit. This can have five values:
             * If it is 0 or outside the following range, we zoom fit normally onto the entire canvas.
             * If it is 1 through 4, we number the quarters from left to right, top to bottom, like reading text.
             *
             * @type {Number}
             */
            this.quarter = 0;

            /**
             * The amount we have to pan to put the newly zoomed image in one of the quarters.
             *
             * @type {Number}
             */
            this.quarterPanAdjust = this.coordinateScale / 4;

            /**
             * First we add a PanDescartesDecorator to set the origin of the canvas.
             */
            this.decoratorComponents.push(new ZoomFitDescartesDecorator());

            /**
             * Finally we add another PanDescartesDecorator to enable a margin on the fit.
             */
            this.decoratorComponents.push(new PanDescartesDecorator());

            /**
             * Propagate the setQuarter function to (probably) the Canvas class.
             */
            this.propagatables.push({
                name: "setQuarter",
                func: this.setQuarter.bind(this)
            });

            /**
             * Propagate the setAlwaysFit function to (probably) the Canvas class.
             */
            this.propagatables.push({
                name: "setAlwaysFit",
                func: this.setAlwaysFit.bind(this)
            });

            /**
             * Propagate the zoomToFit function to (probably) the Canvas class.
             */
            this.propagatables.push({
                name: "zoomToFit",
                func: this.zoomToFit.bind(this)
            });

            /**
             * Propagate the setZoomFitMargin function to (probably) the Canvas class.
             */
            this.propagatables.push({
                name: "setZoomFitMargin",
                func: this.setZoomFitMargin.bind(this)
            });
        }


        QuarterFitDescartesDecorator.prototype = new ZoomFitDescartesDecorator();

        /**
         * Returns the input, adjusted such that all points fit within the canvas inside of a certain margin
         *
         * @param plot {Object[]} The drawing to be adjusted.
         * @modifies fitOnce {boolean} Gets set to false after this decoration.
         * @return {Object[]} The drawing adjusted by zooming and panning to fit everything
         * in the canvas, given that alwaysFit or fitOnce are true. Reuses old adjustments if neither alwaysFit
         * nor fitOnce are true.
         */
        QuarterFitDescartesDecorator.prototype.decorate = function(plot) {
            if (this.alwaysFit || this.fitOnce) {
                // Adjust the zoom fit margin by quarterPanAdjust and a scaled version of this.margin, to prevent points from falling off the canvas.
                this.decoratorComponents[0].setZoomFitMargin(this.quarterPanAdjust + this.margin * 2 * this.quarterPanAdjust / this.coordinateScale);
                this.decoratorComponents[0].zoomToFit();
                switch (this.quarter) {
                    case 1:
                        this.decoratorComponents[1].pan(true, this.quarterPanAdjust, -this.quarterPanAdjust);
                        break;
                    case 2:
                        this.decoratorComponents[1].pan(true, -this.quarterPanAdjust, -this.quarterPanAdjust);
                        break;
                    case 3:
                        this.decoratorComponents[1].pan(true, this.quarterPanAdjust, this.quarterPanAdjust);
                        break;
                    case 4:
                        this.decoratorComponents[1].pan(true, -this.quarterPanAdjust, this.quarterPanAdjust);
                        break;
                    default:
                        // Adjust the zoom fit margin back to only this.margin.
                        this.decoratorComponents[0].setZoomFitMargin(this.margin);
                        this.decoratorComponents[1].pan(true, 0, 0);
                        break;
                }
            }
            for (var j = 0; j < this.decoratorComponents.length; j++) {
                plot = this.decoratorComponents[j].decorate(plot);
            }
            this.fitOnce = false;
            if (this.decorator != null) {
                plot = this.decorator.decorate(plot);
            }
            return plot;
        };

        /**
         * Sets this.fitOnce to true.
         *
         * @modifies this.fitOnce {boolean} gets set to true
         * @modifies this.quarter {Number} gets set to 0
         */
        QuarterFitDescartesDecorator.prototype.zoomToFit = function() {
            this.fitOnce = true;
            this.setQuarter(0);
        };

        /**
         * Sets this.quarter to a new value.
         *
         * @param quarter {Number} The new value for quarter.
         * @modifies this.fitOnce {boolean} gets set to true
         * @modifies this.quarter {Number} gets set to quarter
         */
        QuarterFitDescartesDecorator.prototype.setQuarter = function(quarter) {
            this.fitOnce = true;
            this.quarter = quarter;
        };

        // Exports are needed, such that other modules may invoke methods from this module file.
        return QuarterFitDescartesDecorator;
    });
