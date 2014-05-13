/**
 * We have two environments: the browser and Node. If we are in the browser we should use requirejs and call our functions that way.
 * If we are in node, we should not and instead should just export the various modules for testing purpose.
 *
 * @author Roel Jacobs
 */

/** Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
    sweetModule = "sweet.js";
} else {
    sweetModule = "sweet";

    require.config({
        shim: {
            'underscore': {
                exports: '_'
            }
        },
        baseUrl: "scripts"
    });
}
/*******************************************************************/

// If all requirements are loaded, we may create our 'class'.
define([sweetModule, "jquery"], function(sweet) {
    /**
     * @class
     * @classdesc Base class for passes of the preprocessor.
     */
    function Pass() {}


    /**
     * Parse the given lines of script.
     * Should be overridden by subclasses.
     * The base class only contains precondition checking and returns the given input.
     *
     * @param {String[]} scriptlines Lines of script that need to be parsed.
     * @pre scriptLines != null
     * @pre scriptLines != undefined
     * @return {String[]} the input
     */
    Pass.prototype.parse = function(scriptLines) {
        if (!scriptLines) {
            throw new Error('Pass.parse.pre violated :' +
                'scriptLines is null or undefined');
        }
        return scriptLines;
    };


    Pass.prototype.getLHS = function(line) {
        var equalsIndex = line.indexOf("=");

        return line.substring(0, equalsIndex).trim(); // Left hand side of the definition
    };

    Pass.prototype.getRHS = function(line) {
        var equalsIndex = line.indexOf("=");
        var unitStart = line.indexOf(";");

        // Is a unit defined?
        if (unitStart == -1) {
            return line.substring(equalsIndex + 1).trim();
        } else {
            return line.substring(equalsIndex + 1, unitStart).trim();
        }
    };

    Pass.prototype.getUnits = function(line) {
        var unitStart = line.indexOf(";");

        // Is a unit defined?
        if (unitStart == -1) {
            return '';
        } else {
            return line.substring(unitStart + 1).trim();
        }
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Pass;
});