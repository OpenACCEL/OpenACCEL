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
define(["view/descartes/abstractdescartesdecorator", "view/descartes/zoomdescartesdecorator", "view/descartes/pandescartesdecorator"],
    function(AbstractDescartesDecorator, ZoomDescartesDecorator, PanDescartesDecorator) {
        /**
         * @class ZoomFitDescartesDecorator
         * @classdesc The ZoomFitDescartesDecorator class provides DescartesHandlers to DescartesCanvases,
         * allowing them to correctly draw any supported model element.
         */
        function ZoomFitDescartesDecorator() {

            /**
             * The DescartesHandlers that can be provided by this class.
             *
             * @type {array<AbstractDescartesHandler>}
             */
            this.addDecorator(new PanDescartesDecorator());

            /**
             * The DescartesHandlers that can be provided by this class.
             *
             * @type {array<AbstractDescartesHandler>}
             */
            this.addDecorator(new ZoomDescartesDecorator());

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

            /**
             * The DescartesHandlers that can be provided by this class.
             *
             * @type {array<AbstractDescartesHandler>}
             */
            this.facadify();
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
                pan(true, horMin, verMin);
                zoom(true, (horMax - horMin) / 100, (verMax - verMin) / 100);
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
        ZoomFitDescartesDecorator.prototype.setAlwaysFit = function(bool) {
            this.alwaysFit = bool;
        };
        /**
         * Returns whether the script can be compiled and executed.
         *
         * @return this.analyser.scriptComplete && this.quantities.length > 0
         */
        ZoomFitDescartesDecorator.prototype.zoomToFit = function(bool) {
            this.fitOnce = bool;
        };
        // Exports are needed, such that other modules may invoke methods from this module file.
        return ZoomFitDescartesDecorator;
    });
