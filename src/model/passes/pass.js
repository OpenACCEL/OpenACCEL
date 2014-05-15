/*
 * File containing the Pass class
 *
 * @author Roel Jacobs
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
} else {
    require.config({
        baseUrl: 'scripts'
    });
}
/*******************************************************************/

define([], /**@lends Pass*/ function() {
    /**
     * @class
     * @classdesc Base class for passes of the preprocessor.
     */
    function Pass() {}

    /**
     * Returns the left hand side of a definition,
     * that is, the part before the '=' sign.
     *
     * @param  {String} line String containing the definition
     * @pre line != null
     * @pre line != undefined
     * @return {String}      Left hand side of the definition
     */
    Pass.prototype.getLHS = function(line) {
        if (!line) {
            throw new Error('Pass.getLHS.pre violated :' +
                'line is null or undefined');
        }

        var equalsIndex = line.indexOf('=');

        return line.substring(0, equalsIndex).trim(); // Left hand side of the definition
    };

    /**
     * Returns the right hand side of a definition,
     * that is, the part after the '=' sign and before the ';' (if present).
     *
     * @param  {String} line String containing the definition
     * @pre line != null
     * @pre line != undefined
     * @return {String}      Right hand side of the definition
     */
    Pass.prototype.getRHS = function(line) {
        if (!line) {
            throw new Error('Pass.getRHS.pre violated :' +
                'line is null or undefined');
        }

        var equalsIndex = line.indexOf('=');
        var unitStart = line.indexOf(';');

        // Is a unit defined?
        if (unitStart == -1) {
            return line.substring(equalsIndex + 1).trim();
        } else {
            return line.substring(equalsIndex + 1, unitStart).trim();
        }
    };

    /**
     * Returns the units of a definition,
     * that is, the part after the ';'
     *
     * @param  {String} line String containing the definition
     * @pre line != null
     * @pre line != undefined
     * @return {String}      Units of the definitions, empty String if no unit is present.
     */
    Pass.prototype.getUnits = function(line) {
        if (!line) {
            throw new Error('Pass.getUnits.pre violated :' +
                'line is null or undefined');
        }

        var unitStart = line.indexOf(';');

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