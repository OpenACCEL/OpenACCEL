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
define(["view/graphics/abstractfunctionpropagator"], /* @lends View.Graphics */ function(AbstractFunctionPropagator) {

    /**
     * @class AbstractDescartesDecorator
     * @classdesc The AbstractDescartesDecorator facilitates alteratiion of existing descartes drawings.
     */
    function AbstractDescartesDecorator() {

        /**
         * The next AbstractDescartesDecorator in the decorator chain.
         *
         * @type {AbstractDescartesDecorator}
         */
        this.decorator = null;

        /**
         * The factor of the input normalisation over the output normalisation of descartes.
         *
         * @type {float}
         */
        this.coordinateScale = 100;
    };


    AbstractDescartesDecorator.prototype = new AbstractFunctionPropagator();

    /**
     * Returns the input, adjusted according to this decorator.
     *
     * @param plot {Array<Array<Object>>} The drawing to be adjusted
     * @return plot {Array<Array<Object>>} The adjusted drawing
     */
    AbstractDescartesDecorator.prototype.decorate = function(plot) {
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
     * @return point {Object} The inversely adjusted point.
     */
    AbstractDescartesDecorator.prototype.mapPoint = function(point) {
        if (this.decorator != null) {
            point = this.decorator.mapPoint(point);
        }
        return point;
    };

    /**
     * Adds a new AbstractDescartesDecorator to the end of the decorator chain containing
     * this decorator.
     *
     * @param decorator {AbstractDescartesDecorator} The decorator to be added to the chain
     * @post decorator can be called called recursively by decorate(), mapPoint() and addDecorator()
     */
    AbstractDescartesDecorator.prototype.addDecorator = function(decorator) {
        if (this.decorator == null) {
            this.decorator = decorator;
        } else {
            this.decorator.addDecorator(decorator);
        }
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return AbstractDescartesDecorator;
});
