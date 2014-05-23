/*
 * File containing the AnalyserPass class
 *
 * @author Jacco Snoeren
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

define(['model/passes/pass'], /**@lends Model.Passes.Analyser*/ function(Pass) {
    /**
     * @class
     * @classdesc Analyses a single line of code and updates the quantities in the script.
     */
    function AnalyserPass() {
        /**
         * Regex that extracts quantity references from a definition
         * @type {RegExp}
         */
    	this.regexes.varNames = /(\w*[a-zA-Z_]\w*(?!\w*\s*:))/g;
    }

    AnalyserPass.prototype = new Pass();

    /**
     * Analyse the given line of script.
     * Should be overridden by subclasses.
     * The base class only contains precondition checking and returns the given input.
     *
     * @param {String} line The line of code that needs to be analysed.
     * @param {Object} quantities The quantities of this script with their attributes
     * @pre line != null
     * @pre line != undefined
     * @pre quantities != null
     * @pre quantities != undefined
     * @return {Object} An object containing all the  quantities in the script with their 
     * attributes such as parameters and dependencies.
     */
    AnalyserPass.prototype.analyse = function(line, quantities) {
        if (!line) {
            throw new Error('AnalyserPass.analyse.pre violated :' +
                'line is null or undefined');
        }
        if (!quantities) {
            throw new Error('AnalyserPass.analyse.pre violated:' +
                'quantities is null or undefined');
        }
        
        return quantities;
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return AnalyserPass;
});