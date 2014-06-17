/*
 * notice: still needs support
 for more descarte plottypes
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
define(["view/graphics/abstractdescartesdecorator"], function(AbstractDescartesDecorator) {
    /**
     * @class ZoomDescartesDecorator
     * @classdesc The ZoomDescartesDecorator class provides DescartesHandlers to Canvases,
     * allowing them to correctly draw any supported model element.
     */
    function ZoomDescartesDecorator() {

        /**
         * The DescartesHandlers that can be provided by this class.
         *
         * @type {array<AbstractDescartesHandler>}
         */
        this.horZoom = 1;

        /**
         * The DescartesHandlers that can be provided by this class.
         *
         * @type {array<AbstractDescartesHandler>}
         */
        this.verZoom = 1;
    }


    ZoomDescartesDecorator.prototype = new AbstractDescartesDecorator();

    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    ZoomDescartesDecorator.prototype.decorate = function(plot) {
        for (i in plot) {
            if (plot[i][0].x instanceof Object) {
                for (j in plot[i][plot[i][0].x.ref]) {
                    plot[i][plot[i][0].x.ref][j] *= this.horZoom;
                }
            } else {
                plot[i][0].x *= this.horZoom;
            }
            if (plot[i][0].y instanceof Object) {
                for (j in plot[i][plot[i][0].y.ref]) {
                    plot[i][plot[i][0].y.ref][j] *= this.verZoom;
                }
            } else {
                plot[i][0].y *= this.verZoom;
            }
        }
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
    ZoomDescartesDecorator.prototype.mapPoint = function(point) {
        if (this.decorator != null) {
            point = this.decorator.mapPoint(point);
        }
        point.x /= this.horZoom;
        point.y /= this.verZoom;
        return point;
    };

    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    ZoomDescartesDecorator.prototype.zoom = function(isAbsolute, widthFactor, heightFactor) {
        if (isAbsolute) {
            this.horZoom = widthFactor;
            this.verZoom = heightFactor;
        } else {
            this.horZoom *= widthFactor;
            this.verZoom *= heightFactor;
        }
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return ZoomDescartesDecorator;
});
