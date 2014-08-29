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
define(["View/Graphics/DescartesHandlerFactory",
        "View/Graphics/Canvas",
        "View/Graphics/ScriptDescartesHandler",
        "View/Graphics/GeneticOptimisationDescartesHandler",
        "View/Graphics/AnalysisDescartesHandler" ],
    /** @lends View.Graphics */
    function(DescartesHandlerFactory,
             Canvas,
             ScriptDescartesHandler,
             GeneticOptimisationDescartesHandler,
             AnalysisDescartesHandler) {

        /**
         * @class
         * @classdesc The CanvasCreator class forms an abstracted environment for creating instances of the Canvas class.
         * All facilities needed to do so are loaded upon construction.
         */
        CanvasCreator = function() {

            /**
             * The factory this canvas creator uses to provide its canvases with the right handlers.
             *
             * @type {DescartesHandlerFactory}
             */
            this.factory = new DescartesHandlerFactory();

            /**
             * Add ScriptDescartesHandler to the factory, to support drawing the Script class.
             */
            this.factory.addHandler(new ScriptDescartesHandler());

            /**
             * Add GeneticOptimisationDescartesHandler to the factory, to support drawing the GeneticOptimisation class.
             */
            this.factory.addHandler(new GeneticOptimisationDescartesHandler());

            /**
             * Add AnalysisDescartesHandler to the factory, to support drawing the Analysis class.
             */
            this.factory.addHandler(new AnalysisDescartesHandler());
        };

        CanvasCreator.prototype = {

            /**
             * Returns a newly created canvas which can draw the given modelElement, given that the handler exists.
             * The created canvas also already supports the functionality of its handler.
             *
             * @return {Canvas} The canvas created by this.
             */
            createCanvas: function(modelElement, div, width, height) {
                canvas = new Canvas(modelElement, div, width, height, this.factory);
                return canvas;
            }
        };

        // Exports are needed, such that other modules may invoke methods from this module file.
        return CanvasCreator;
    });
