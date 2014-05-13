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
            } else {
                var scriptInLines = script.split('\n');
                //line represents a line in the script
                //@type {String}
                var result;
                for (var line in scriptInLines) {
                    line.trim();

                }
                return result;
            }
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

        }

    }

    // If we are in the browser, we want to execute the compile function at the start.
    if (inBrowser) {
        Preprocessor.compile();
    }

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Preprocessor;
});