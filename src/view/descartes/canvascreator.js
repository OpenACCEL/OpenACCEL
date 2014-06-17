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
define(["view/descartes/descarteshandlerfactory", "view/descartes/descartescanvas", "view/descartes/scriptdescarteshandler", "view/descartes/speadescarteshandler"],
    function(DescartesHandlerFactory, DescartesCanvas, ScriptDescartesHandler, SPEADescartesHandler) {

        CanvasCreator = function() {
            this.factory = new DescartesHandlerFactory();
            this.factory.addHandler(new ScriptDescartesHandler());
            this.factory.addHandler(new SPEADescartesHandler());
        }

        CanvasCreator.prototype = {

            createDescartesCanvas: function(modelElement, div, width, height) {
                canvas = new DescartesCanvas(modelElement, div, width, height, this.factory);
                canvas.facadify();
                return canvas;
            }
        }

        return CanvasCreator;
    });
