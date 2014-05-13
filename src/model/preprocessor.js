/**
 * We have two environments: the browser and Node. If we are in the browser we should use requirejs and call our functions that way.
 * If we are in node, we should not and instead should just export the various modules for testing purpose.
 *
 * @author Roy Stoof
 */

/** Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;
if (inNode) {
    require = require('requirejs');
    sweetModule = "sweet.js";
} else {
    sweetModule = "sweet";
}

require.config({
    shim: {
        'underscore': {
            exports: '_'
        }
    }
});
/*******************************************************************/

// If all requirements are loaded, we may create our 'class'.
define([sweetModule, "jquery"], function(sweet) {
    /**
     * @class
     * @classdesc First pass in compiling. Translates an Accel script to a script that can be expanded by macros.
     */
    var Preprocessor = {
        /**
         * parse description
         * @param  {type} script description
         * @return {type}        description
         */
        parse: function(script) {
            //make lines
            //translate the lines
        },

        /**
         * Transforms the input {@code script} to an array of strings,
         * each representing a line.
         * @param  {String} script the input script given as a String
         * @pre script != null
         * @pre script != undefined
         * @return {String[]} an array containing all lines in {@code script}
         */
        scriptToLines: function(script) {
            if (!script) {
                throw new Error('PreProcessor.scriptToLines.pre violated :' +
                    'script is null or undefined');
            }
            var scriptInLines = script.split('\n'); // the script in lines @type {String[]}
            return this.trimLines(scriptInLines);
        },

        trimLines: function(scriptArray) {
            if (!scriptArray) {
                throw new Error('Preprocessor.trimLines.pre violated:' +
                    'scriptArray is null or undefined');
            }
            for (var i = 0; i < scriptArray.length; i++) {
                scriptArray[i] = scriptArray[i].trim();
            }
            return scriptArray;
        },

        /**
         * Translates a line of Accel script to a line that can be expanded using macros.
         * Examples:
         * x = 5 becomes func(x = 5)
         * x = 5 ; kg becomes func(x = 5 ; {'kg' : 1})
         * z = 2 + sin(y + sin(x)) + 4 + sin(2) becomes func(z = 2 + sin(exe.y() + sin(exe.x())) + 4 + sin(2))
         *
         *
         * @param  {String} a line of Accell script
         * @pre line != null
         * @pre line != undefined
         * @return {String}      Translated line
         */
        translateLine: function(line) {
            if (!line) {
                throw new Error("Preprocessor.translateLine.pre failed. line is null or undefined");
            }
           
            var equalsIndex = line.indexOf("=");
            var unitStart = line.indexOf(";");

            var lhs = line.substring(0, equalsIndex); // Left hand side of the definition
            var rhs; // right hand side of the definition
            var units; // unit definition

            if (unitStart == -1) {
                rhs = line.substring(equalsIndex + 1);
            } else {
                rhs = line.substring(equalsIndex + 1, unitStart);
                units = line.substring(unitStart + 1);
            }
        }

        /**
         * [translateUnit description]
         * @param  {[type]} units [description]
         * @return {[type]}       [description]
         */
        translateUnits: function(units) {

        }

        /**
         * [translateRHS description]
         * @param  {[type]} rhs [description]
         * @return {[type]}     [description]
         */
        translateRHS: function(rhs) {

        }

    }

    // If we are in the browser, we want to execute the compile function at the start.
    if (inBrowser) {
        Preprocessor.compile();
    }

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Preprocessor;
});