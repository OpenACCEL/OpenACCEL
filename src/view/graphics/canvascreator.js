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
define(["view/graphics/descarteshandlerfactory", "view/graphics/canvas", "view/graphics/scriptdescarteshandler"],
    function(DescartesHandlerFactory, Canvas, ScriptDescartesHandler) {

        CanvasCreator = function() {
            this.factory = new DescartesHandlerFactory();
            this.factory.addHandler(new ScriptDescartesHandler());
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
