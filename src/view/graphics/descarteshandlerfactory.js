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
define(["view/graphics/abstractdescarteshandler"], function(AbstractDescartesHandler) {

    /**
     * @class DescartesHandlerFactory
     * @classdesc The DescartesHandlerFactory class provides DescartesHandlers to Canvases,
     * allowing them to correctly draw any supported model element.
     */
    function DescartesHandlerFactory() {
        /**
         * The DescartesHandlers that can be provided by this class.
         *
         * @type {array<AbstractDescartesHandler>}
         */
        this.handlers = [];
    }


    DescartesHandlerFactory.prototype = {

        /**
         * Returns whether the script can be compiled and executed.
         *
         * @return this.analyser.scriptComplete && this.quantities.length > 0
         */
        getHandler: function(modelElement) {
            for (i in this.handlers) {
                if (this.handlers[i].canHandle(modelElement)) {
                    return this.handlers[i].getInstance(modelElement);
                }
            }
            return null;
        },

        /**
         * Returns whether the script can be compiled and executed.
         *
         * @return this.analyser.scriptComplete && this.quantities.length > 0
         */
        addHandler: function(handler) {
            if (handler instanceof AbstractDescartesHandler) {
                this.handlers.push(handler);
            }
        }
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return DescartesHandlerFactory;
});
