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
define(["view/descartes/abstractfunctionpropagator"], function(AbstractFunctionPropagator) {
    /**
     * @class AbstractDescartesDecorator
     * @classdesc The AbstractDescartesDecorator class provides DescartesHandlers to DescartesCanvases,
     * allowing them to correctly draw any supported model element.
     */
    function AbstractDescartesDecorator() {

        /**
         * The DescartesHandlers that can be provided by this class.
         *
         * @type {array<AbstractDescartesHandler>}
         */
        this.decorator = null;

        this.coordinateScale = 100;
    };


    AbstractDescartesDecorator.prototype = new AbstractFunctionPropagator();

    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    AbstractDescartesDecorator.prototype.decorate = function(plot) {
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
    AbstractDescartesDecorator.prototype.mapPoint = function(point) {
        if (this.decorator != null) {
            point = this.decorator.mapPoint(point);
        }
        return point;
    };

    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
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
