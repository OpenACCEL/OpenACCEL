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
define(["View/Graphics/AbstractDescartesHandler"], /** @lends View.Graphics */ function(AbstractDescartesHandler) {

    /**
     * @class
     * @classdesc The DescartesHandlerFactory class provides DescartesHandlers to Canvases,
     * allowing them to correctly draw any supported model element.
     */
    function DescartesHandlerFactory() {
        /**
         * The DescartesHandlers that can be provided by this class.
         *
         * @type {AbstractDescartesHandler[]}
         */
        this.handlers = [];
    }


    DescartesHandlerFactory.prototype = {

        /**
         * Returns a DescartesHandler which can handle the given modelElement, with it as its modelElement.
         *
         * @param modelElement {Object} The modelElement to be drawn by the returned handler.
         * @return {AbstractDescartesHandler} The handler that can draw modelElement.
         * @pre Exists_i[ i in this.handlers : handlers[i].canHandle(modelElement)]
         */
        getHandler: function(modelElement) {
            for (var i in this.handlers) {
                if (this.handlers[i].canHandle(modelElement)) {
                    return this.handlers[i].getInstance(modelElement);
                }
            }
            return null;
        },

        /**
         * Adds a DescartesHandler to the set of handlers, such that more different modelElements can be provided with handlers.
         *
         * @param handler {AbstractDescartesHandler}
         * @modifies this.handlers {AbstractDescartesHandler[]} This gets handler added to it.
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
