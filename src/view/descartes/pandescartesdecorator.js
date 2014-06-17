/*
 * notice: still needs support for more descarte plottypes
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
define(["view/descartes/abstractdescartesdecorator"], function(AbstractDescartesDecorator) {
    /**
     * @class PanDescartesDecorator
     * @classdesc The PanDescartesDecorator class provides DescartesHandlers to DescartesCanvases,
     * allowing them to correctly draw any supported model element.
     */
    function PanDescartesDecorator() {

        /**
         * The DescartesHandlers that can be provided by this class.
         *
         * @type {array<AbstractDescartesHandler>}
         */
        this.horOffset = 0;

        /**
         * The DescartesHandlers that can be provided by this class.
         *
         * @type {array<AbstractDescartesHandler>}
         */
        this.verOffset = 0;
    }


    PanDescartesDecorator.prototype = new AbstractDescartesDecorator();

    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    PanDescartesDecorator.prototype.decorate = function(plot) {
        for (i in plot) {
            if (plot[i][0].x instanceof Object) {
                for (j in plot[i][plot[i][0].x.ref]) {
                    plot[i][plot[i][0].x.ref][j] += this.horOffset;
                }
            } else {
                plot[i][0].x += this.horOffset;
            }
            if (plot[i][0].y instanceof Object) {
                for (j in plot[i][plot[i][0].y.ref]) {
                    plot[i][plot[i][0].y.ref][j] += this.verOffset;
                }
            } else {
                plot[i][0].y += this.verOffset;
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
        point.x -= this.horOffset;
        point.y -= this.verOffset;
        return point;
    };

    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    PanDescartesDecorator.prototype.pan = function(isAbsolute, horOffset, verOffset) {
        if (isAbsolute) {
            this.horOffset = horOffset;
            this.verOffset = verOffset;
        } else {
            this.horOffset += horOffset;
            this.verOffset += verOffset;
        }
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return PanDescartesDecorator;
});
