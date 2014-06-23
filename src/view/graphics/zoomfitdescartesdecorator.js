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
define(["view/graphics/abstractdescartesdecorator", "view/graphics/zoomdescartesdecorator", "view/graphics/pandescartesdecorator"],
    /** @lends View.Graphics */
    function(AbstractDescartesDecorator, ZoomDescartesDecorator, PanDescartesDecorator) {

        /**
         * @class
         * @classdesc The ZoomFitDescartesDecorator decorates descartes drawings by zooming and panning
         * as to fit all drawing elements in the canvas with some margin.
         */
        function ZoomFitDescartesDecorator() {

            /**
             * First we must reset propagatables, otherwise these are shared among all subclasses of AbstractFunctionPropagator.
             */
            this.propagatables = [];

            /**
             * The decorator components this composite decorator borrows functionality from.
             *
             * @type {AbstractDescartesDecorator[]}
             */
            this.decoratorComponents = [];

            /**
             * First we add a PanDescartesDecorator to set the origin of the canvas.
             */
            this.decoratorComponents.push(new PanDescartesDecorator());

            /**
             * Then we add a ZoomDescartesDecorator to scale on that origin to fit everything exactly.
             */
            this.decoratorComponents.push(new ZoomDescartesDecorator());

            /**
             * Finally we add another PanDescartesDecorator to enable a margin on the fit.
             */
            this.decoratorComponents.push(new PanDescartesDecorator());

            /**
             * Whether or not we always apply zoom fitting to a drawing.
             *
             * @type {boolean}
             */
            this.alwaysFit = false;

            /**
             * Whether or not the next drawing iteration will form the base of the zoom fit adjustment from then on.
             *
             * @type {boolean}
             */
            this.fitOnce = false;

            /**
             * Margin in percentage of the canvas to set around the zoom fit.
             *
             * @type {Number}
             */
            this.margin = 0;

            /**
             * The adjustment factor with which the zoom has to be adjusted to allow for the margin.
             *
             * @type {array<AbstractDescartesHandler>}
             */
            this.marginZoomAdjust = 1;

            /**
             * Set the margin and marginZoomAdjust to a default with a margin of 5%.
             */
            this.setZoomFitMargin(5);

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


        ZoomFitDescartesDecorator.prototype = new AbstractDescartesDecorator();

        /**
         * Returns the input, adjusted such that all points fit within the canvas inside of a certain margin
         *
         * @param plot {Object[]} The drawing to be adjusted.
         * @modifies fitOnce {boolean} Gets set to false after this decoration.
         * @return plot {Object[]} The drawing adjusted by zooming and panning to fit everything
         * in the canvas, given that alwaysFit or fitOnce are true. Reuses old adjustments if neither alwaysFit
         * nor fitOnce are true.
         */
        ZoomFitDescartesDecorator.prototype.decorate = function(plot) {
            if (this.alwaysFit || this.fitOnce) {
                var horMax = -Infinity;
                var horMin = Infinity;
                var verMax = -Infinity;
                var verMin = Infinity;
                for (i in plot) {
                    if (plot[i][0].x instanceof Object) {
                        for (j in plot[i][plot[i][0].x.ref]) {
                            horMax = Math.max(plot[i][plot[i][0].x.ref][j], horMax);
                            horMin = Math.min(plot[i][plot[i][0].x.ref][j], horMin);
                        }
                    } else {
                        horMax = Math.max(plot[i][0].x, horMax);
                        horMin = Math.min(plot[i][0].x, horMin);
                    }
                    if (plot[i][0].y instanceof Object) {
                        for (j in plot[i][plot[i][0].y.ref]) {
                            verMax = Math.max(plot[i][plot[i][0].y.ref][j], verMax);
                            verMin = Math.min(plot[i][plot[i][0].y.ref][j], verMin);
                        }
                    } else {
                        verMax = Math.max(plot[i][0].y, verMax);
                        verMin = Math.min(plot[i][0].y, verMin);
                    }
                }
                this.decoratorComponents[0].pan(true, horMin, verMin);
                this.decoratorComponents[1].zoom(true, this.marginZoomAdjust * this.coordinateScale / (horMax - horMin),
                    this.marginZoomAdjust * this.coordinateScale / (verMax - verMin));
                this.decoratorComponents[2].pan(true, -this.margin, -this.margin);
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
         * Returns a point with coordinates, inversely adjusted by this decorator.
         * These points come from descartes through callbacks, hence they must undergo inverse
         * adjustment to match the original drawing context.
         *
         * @param point {Object} The point to be inversely adjusted, containing an 'x', a 'y' and
         * possibly a 'z' coordinate.
         * @return point {Object} The inversely adjusted point, applying the set of decorator components'
         * mapPoint functions in reverse order.
         */
        ZoomFitDescartesDecorator.prototype.mapPoint = function(point) {
            if (this.decorator != null) {
                point = this.decorator.mapPoint(point);
            }
            for (var j = this.decoratorComponents.length - 1; j >= 0; j--) {
                point = this.decoratorComponents[j].mapPoint(point);
            }
            return point;
        };

        /**
         * Sets this.alwaysFit to a new value.
         *
         * @param bool {boolean} The new value for alwaysFit.
         * @modifies this.alwaysFit {boolean} gets set to bool
         */
        ZoomFitDescartesDecorator.prototype.setAlwaysFit = function(bool) {
            this.alwaysFit = bool;
        };

        /**
         * Sets this.fitOnce to true.
         *
         * @modifies this.fitOnce {boolean} gets set to true
         */
        ZoomFitDescartesDecorator.prototype.zoomToFit = function() {
            this.fitOnce = true;
        };

        /**
         * Sets this.marin to a new value, and adjusts this.marginZoomAdjust accordingly.
         *
         * @param margin {Number} The new value of this.margin.
         * @modifies this.margin {Number} gets set to margin
         * @modifies this.marginZoomAdjust {Number} is changed to accomodate for this.margin from all sides.
         */
        ZoomFitDescartesDecorator.prototype.setZoomFitMargin = function(margin) {
            this.margin = margin;
            this.marginZoomAdjust = 1 - (2 * this.margin / this.coordinateScale);
        };

        // Exports are needed, such that other modules may invoke methods from this module file.
        return ZoomFitDescartesDecorator;
    });
