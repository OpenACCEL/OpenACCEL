/*
 *
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
define(["View/Graphics/AbstractDescartesDecorator"], /** @lends View.Graphics */ function(AbstractDescartesDecorator) {

    /**
     * @class
     * @classdesc The ZoomDescartesDecorator decorates descartes drawings by multiplying
     * the x and y co-ordinates.
     *
     * This class does not yet support all descartes plotTypes.
     */
    function ZoomDescartesDecorator() {

        /**
         * The factor at which the horizontal axis is scaled.
         *
         * @type {Number}
         */
        this.horZoom = 1;

        /**
         * The factor at which the vertical axis is scaled.
         *
         * @type {Number}
         */
        this.verZoom = 1;

        /**
         * The maximum factor we scale at to prevent rounding issues and division by 0.
         *
         * @type {Number}
         */
        this.maxFactor = 1000000;
    }


    ZoomDescartesDecorator.prototype = new AbstractDescartesDecorator();

    /**
     * Returns the input, with all x and y co-ordinates scaled by horZoom and verZoom respectively.
     *
     * @param plot {Object[]} The drawing to be adjusted.
     * @return plot {Object[]} The drawing with all x co-ordinates multiplied by horZoom
     * and all y co-ordinates multiplied by verZoom.
     */
    ZoomDescartesDecorator.prototype.decorate = function(plot) {
        var i;
        
        var xPoints = plot[0].locations.data.x;
        for (i in xPoints) {
            xPoints[i] *= this.horZoom;
        }

        var yPoints = plot[0].locations.data.y;
        for (i in yPoints) {
            yPoints[i] *= this.verZoom;
        }

        if (this.decorator !== null) {
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
     * @return point {Object} The point with its x co-ordinate divided by horZoom and its y co-ordinate
     * divided by verZoom.
     */
    ZoomDescartesDecorator.prototype.mapPoint = function(point) {
        if (this.decorator !== null) {
            point = this.decorator.mapPoint(point);
        }
        point.x /= this.horZoom;
        point.y /= this.verZoom;
        return point;
    };

    /**
     * Either sets the horizontal and vertical zooms or adjusts them
     *
     * @param isAbsolute {boolean} If the new zooms should override or adjust the old ones.
     * @param widthFactor {Number} The new horizontal zoom if isAbsolute, or zoom adjustment if not.
     * @param heightFactor {Number} The new vertical zoom if isAbsolute, or zoom adjustment if not.
     * @modifies this.horZoom {Number} Gets overwritten with widthFactor or multiplied by it.
     * @modifies this.verZoom {Number} Gets overwritten with heightFactor or multiplied by it.
     */
    ZoomDescartesDecorator.prototype.zoom = function(isAbsolute, widthFactor, heightFactor) {
        if (isAbsolute) {
            this.horZoom = widthFactor;
            this.verZoom = heightFactor;
        } else {
            this.horZoom *= widthFactor;
            this.verZoom *= heightFactor;
        }
        this.horZoom = Math.min(this.maxFactor, this.horZoom);
        this.verZoom = Math.min(this.maxFactor, this.verZoom);
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return ZoomDescartesDecorator;
});
