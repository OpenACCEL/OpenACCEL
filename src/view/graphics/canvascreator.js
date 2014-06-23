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
define(["view/graphics/descarteshandlerfactory", "view/graphics/canvas", "view/graphics/scriptdescarteshandler", "view/graphics/geneticoptimisationdescarteshandler"],
    /** @lends View.Graphics */
    function(DescartesHandlerFactory, Canvas, ScriptDescartesHandler, GeneticOptimisationDescartesHandler) {

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
        }

        CanvasCreator.prototype = {

            /**
             * Returns a newly created canvas which can draw the given modelElement, given that the handler exists.
             * The created canvas also already supports the functionality of its handler.
             *
             * @return canvas {Canvas} The canvas created by this.
             */
            createCanvas: function(modelElement, div, width, height) {
                canvas = new Canvas(modelElement, div, width, height, this.factory);
                canvas.facadify();
                return canvas;
            }
        }

        // Exports are needed, such that other modules may invoke methods from this module file.
        return CanvasCreator;
    });
