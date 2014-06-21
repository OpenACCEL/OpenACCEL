/*
 * TODO: JSDoc
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
    function(AbstractDescartesDecorator, ZoomDescartesDecorator, PanDescartesDecorator) {
        /**
         * @class ZoomFitDescartesDecorator
         * @classdesc The ZoomFitDescartesDecorator class provides DescartesHandlers to Canvases,
         * allowing them to correctly draw any supported model element.
         */
        function ZoomFitDescartesDecorator() {
            /**
             * First we must reset propagatables, otherwise these are shared among all subclasses of AbstractFunctionPropagator.
             */
            this.propagatables = [];

            this.decoratorComponents = [];
            /**
             * The DescartesHandlers that can be provided by this class.
             *
             * @type {array<AbstractDescartesHandler>}
             */
            this.decoratorComponents.push(new PanDescartesDecorator());

            /**
             * The DescartesHandlers that can be provided by this class.
             *
             * @type {array<AbstractDescartesHandler>}
             */
            this.decoratorComponents.push(new ZoomDescartesDecorator());
            this.decoratorComponents.push(new PanDescartesDecorator());

            /**
             * The DescartesHandlers that can be provided by this class.
             *
             * @type {array<AbstractDescartesHandler>}
             */
            this.alwaysFit = false;

            /**
             * The DescartesHandlers that can be provided by this class.
             *
             * @type {array<AbstractDescartesHandler>}
             */
            this.fitOnce = false;

            this.propagatables.push({
                name: "zoomToFit",
                func: this.zoomToFit.bind(this)
            });

            this.margin = 5;

            this.marginZoomAdjust = 1 - (2 * this.margin / 100);
        }


        ZoomFitDescartesDecorator.prototype = new AbstractDescartesDecorator();

        /**
         * Returns whether the script can be compiled and executed.
         *
         * @return this.analyser.scriptComplete && this.quantities.length > 0
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
         * Returns whether the script can be compiled and executed.
         *
         * @return this.analyser.scriptComplete && this.quantities.length > 0
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
         * Returns whether the script can be compiled and executed.
         *
         * @return this.analyser.scriptComplete && this.quantities.length > 0
         */
        ZoomFitDescartesDecorator.prototype.setAlwaysFit = function(bool) {
            this.alwaysFit = bool;
        };

        /**
         * Returns whether the script can be compiled and executed.
         *
         * @return this.analyser.scriptComplete && this.quantities.length > 0
         */
        ZoomFitDescartesDecorator.prototype.zoomToFit = function() {
            this.fitOnce = true;
        };

        // Exports are needed, such that other modules may invoke methods from this module file.
        return ZoomFitDescartesDecorator;
    });
