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
define(["view/graphics/abstractdescartesdecorator"], /** @lends View.Graphics */ function(AbstractDescartesDecorator) {

    /**
     * @class
     * @classdesc The PanDescartesDecorator decorates descartes drawings by linearly translating
     * the x and y co-ordinates.
     *
     * This class does not yet support all descartes plotTypes.
     */
    function PanDescartesDecorator() {

        /**
         * The offset used as the new 0 point for the horizontal axis.
         *
         * @type {Number}
         */
        this.horOffset = 0;

        /**
         * The offset used as the new 0 point for the vertical axis.
         *
         * @type {Number}
         */
        this.verOffset = 0;
    }


    PanDescartesDecorator.prototype = new AbstractDescartesDecorator();

    /**
     * Returns the input, with all x and y co-ordinates translated by horOffset and verOffset.
     *
     * @param plot {Object[]][]} The drawing to be adjusted.
     * @return plot {Object[]][]} The drawing with all x co-ordinates adjusted by -horOffset
     * and y co-ordinates adjusted by -verOffset.
     */
    PanDescartesDecorator.prototype.decorate = function(plot) {
        for (i in plot) {
            if (plot[i][0].x instanceof Object) {
                for (j in plot[i][plot[i][0].x.ref]) {
                    plot[i][plot[i][0].x.ref][j] -= this.horOffset;
                }
            } else {
                plot[i][0].x -= this.horOffset;
            }
            if (plot[i][0].y instanceof Object) {
                for (j in plot[i][plot[i][0].y.ref]) {
                    plot[i][plot[i][0].y.ref][j] -= this.verOffset;
                }
            } else {
                plot[i][0].y -= this.verOffset;
            }
        }
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
     * @return point {Object} The point adjusted by +horOffset on the x co-ordinates and +verOffset on the y co-ordinates.
     */
    PanDescartesDecorator.prototype.mapPoint = function(point) {
        if (this.decorator != null) {
            point = this.decorator.mapPoint(point);
        }
        point.x += this.horOffset;
        point.y += this.verOffset;
        return point;
    };

    /**
     * Either sets the horizontal and vertical offsets or adjusts them
     *
     * @param isAbsolute {boolean} If the new offsets should override or adjust the old ones.
     * @param horOffset {Number} The new horizontal offset if isAbsolute, or offset adjustment if not.
     * @param verOffset {Number} The new vertical offset if isAbsolute, or offset adjustment if not.
     * @modifies this.horOffset {Number} Gets overwritten with horOffset or summed with it.
     * @modifies this.verOffset {Number} Gets overwritten with verOffset or summed with it.
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
