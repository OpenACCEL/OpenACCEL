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
define(["view/graphics/descarteshandlerfactory", "view/graphics/canvas", "view/graphics/scriptdescarteshandler", "view/graphics/geneticoptimisationdescarteshandler"],
    function(DescartesHandlerFactory, Canvas, ScriptDescartesHandler, GeneticOptimisationDescartesHandler) {

        CanvasCreator = function() {
            this.factory = new DescartesHandlerFactory();
            this.factory.addHandler(new ScriptDescartesHandler());
            this.factory.addHandler(new GeneticOptimisationDescartesHandler());
        }

        CanvasCreator.prototype = {

            createCanvas: function(modelElement, div, width, height) {
                canvas = new Canvas(modelElement, div, width, height, this.factory);
                canvas.facadify();
                return canvas;
            }
        }

        return CanvasCreator;
    });
