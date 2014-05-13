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
         * Parses the input script to a script thar can be expanded by macros.
         * @param  {String} script input (Accel) scrpit
         * @pre script != null
         * @pre script != undefined
         * @return {String}        exmpandable script.
         */
        parse: function(script) {
            if (!script) {
                throw new Error('PreProcessor.parse.pre violated :' +
                    'script is null or undefined');
            }
            // Create the lines.
            var lines = this.scriptToLines(script);

            // Translate the lines.
            for (var i = 0; i > lines.length; i++) {
                lines[i] = this.translateLine(line[i]);
            }

            // Create output.
            var result  = "(function () { \n var exe = {}; \n";
            for (var i = 0; i > lines.length; i++) {
                result += lines[i] + "\n";
            }
            result += "return exe; \n })()";

            return result;
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

            var lhs = line.substring(0, equalsIndex).trim(); // Left hand side of the definition
            var rhs; // right hand side of the definition
            var units; // unit definition

            // Is a unit defined?
            if (unitStart == -1) {
                rhs = line.substring(equalsIndex + 1);
            } else {
                rhs = line.substring(equalsIndex + 1, unitStart);
                units = line.substring(unitStart + 1);
            }

            // Format the output
            var result = "func("
            result += lhs + " = " +  this.translateRHS(rhs);
            if (units)
            {
                result += " ; " + this.translateUnits(units);
            }
            result += ")"

            return result;
        },

        /**
         * translateUnit description
         * @param  {type} units description
         * @return {type}       escription
         */
        translateUnits: function(units) {

        },

        /**
         * Translates the right hand side of an Accel definition to a macro compatible string.
         * @param  {String} rhs Right hand side of an Accel definitions
         * @pre rhs != null
         * @pre rhs != undefined
         * @return {String}     a macro compatible string.
         */
        translateRHS: function(rhs) {
            if (!rhs) {
                throw new Error("Preprocessor.translateRHS.pre failed. rhs is null or undefined");
            }

            var trimmed = rhs.trim();

            return trimmed.replace(/\w*[a-zA-Z]\w*\b(?!\()/g, function(s) {
                return "exe." + s + "()"
            });
        }

    }

    // If we are in the browser, we want to execute the compile function at the start.
    if (inBrowser) {
        Preprocessor.compile();
    }

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Preprocessor;
});