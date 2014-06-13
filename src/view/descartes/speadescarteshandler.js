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
define(["view/descartes/abstractdescarteshandler", "view/descartes/zoomfitdecorator"], function(AbstractDescartesHandler, ZoomFitDecorator) {
    /**
     * @class SPEADescartesHandler
     * @classdesc The SPEADescartesHandler class provides DescartesHandlers to DescartesCanvases,
     * allowing them to correctly draw any supported model element.
     */
    function SPEADescartesHandler(modelElement) {
        /**
         * The DescartesHandlers that can be provided by this class.
         *
         * @type {array<AbstractDescartesHandler>}
         */
        this.modelElement = modelElement;

        this.decorator = new ZoomFitDecorator();
    };


    SPEADescartesHandler.prototype = new AbstractDescartesHandler();

    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    SPEADescartesHandler.prototype.canHandle = function(modelElement) {
        return modelElement instanceof SPEA;
    };


    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    SPEADescartesHandler.prototype.getInstance = function(modelElement) {
        return new SPEADescartesHandler(modelElement);
    };


    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    SPEADescartesHandler.prototype.addDescartes = function(div, width, height) {
        this.descartesInstances.push(new descartes({
            dN: div,
            cW: width,
            cH: height,
            cB: this.clickCallback(x, y);
        }));
        this.descartesInstances[this.descartesInstances.length - 1].setUpGraph();
    };

    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    SPEADescartesHandler.prototype.clickCallback = function(x, y) {

    };


    /**
     * Returns whether the script can be compiled and executed.
     *
     * @return this.analyser.scriptComplete && this.quantities.length > 0
     */
    SPEADescartesHandler.prototype.getDrawing = function() {
        //        //PASTED FROM KEES!!!
        //        var xx = [];
        //        var yy = [];
        //        var rr = [];
        //        var gg = [];
        //        var bb = [];
        //        var dd = [];
        //        var xxP = [];
        //        var yyP = [];
        //        var rrP = [];
        //        var ggP = [];
        //        var bbP = [];
        //        var ddP = [];
        //        var nOnFront = 0;
        //        var j = 0
        //        for (var i = 0; i < curPop.length; i++) {
        //            if (curPop[i][frontPtr]) {
        //                xxP.push(100 * (curPop[i][horPtr] - scaleHorMin) / (scaleHorMax - scaleHorMin));
        //                yyP.push(100 * (curPop[i][verPtr] - scaleVerMin) / (scaleVerMax - scaleVerMin));
        //            } else {
        //                xx.push(100 * (curPop[i][horPtr] - scaleHorMin) / (scaleHorMax - scaleHorMin));
        //                yy.push(100 * (curPop[i][verPtr] - scaleVerMin) / (scaleVerMax - scaleVerMin));
        //            }
        //            if (curPop[i][frontPtr]) {
        //                nOnFront++;
        //                if (!curPop[i][colPtr]) {
        //                    rrP.push(255);
        //                    ggP.push(0);
        //                    bbP.push(0);
        //                    ddP.push(2);
        //                } else {
        //                    rrP.push(255);
        //                    ggP.push(255);
        //                    bbP.push(255);
        //                    ddP.push(2);
        //                }
        //            } else {
        //                if (!curPop[i][colPtr]) {
        //                    rr.push(0);
        //                    gg.push(150);
        //                    bb.push(150);
        //                    dd.push(1);
        //                } else {
        //                    rr.push(255);
        //                    gg.push(255);
        //                    bb.push(255);
        //                    dd.push(1);
        //                }
        //            }
        //        }
        //        // we pass the number of points as a parameter to enforce descartes always to draw the full set. Otherwise,
        //        // we run the risk that if the nr of points increases (e.g. because the user requests more solutions),
        //        // descartes decides not to re-parse the control string, and therefore does not re-allocate the arrays of elements.
        //        var ctrl = {
        //            'plotType': 'bubble',
        //            'col_r': {
        //                'mode': 'data',
        //                'ref': 3
        //            },
        //            'col_g': {
        //                'mode': 'data',
        //                'ref': 4
        //            },
        //            'col_b': {
        //                'mode': 'data',
        //                'ref': 5
        //            },
        //            'diameter': {
        //                'mode': 'data',
        //                'ref': 6
        //            },
        //            'x': {
        //                'mode': 'data',
        //                'ref': 1
        //            },
        //            'y': {
        //                'mode': 'data',
        //                'ref': 2
        //            }
        //        };
        //        var ctrlP = {
        //            'plotType': 'bubble',
        //            'col_r': {
        //                'mode': 'data',
        //                'ref': 3
        //            },
        //            'col_g': {
        //                'mode': 'data',
        //                'ref': 4
        //            },
        //            'col_b': {
        //                'mode': 'data',
        //                'ref': 5
        //            },
        //            'diameter': {
        //                'mode': 'data',
        //                'ref': 6
        //            },
        //            'x': {
        //                'mode': 'data',
        //                'ref': 1
        //            },
        //            'y': {
        //                'mode': 'data',
        //                'ref': 2
        //            }
        //        };
        //        return [[ctrl, xx, yy, rr, gg, bb, dd], [ctrlP, xxP, yyP, rrP, ggP, bbP, ddP]];
        return [[
            ['plotType': 'bubble', 'diameter': 10, 'x': 50, 'y': 50]
        ]]
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return SPEADescartesHandler;
});
