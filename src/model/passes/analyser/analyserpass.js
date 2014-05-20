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

define(['model/passes/pass'], /**@lends AnalyserPass*/ function(Pass) {
    /**
     * @class
     * @classdesc Abstract Pass that is part of compiling the script.
     */
    function AnalyserPass() {
    	this.regexes.varNames = /([a-zA-Z]\w*)/g;
    }

    AnalyserPass.prototype = new Pass();

    /**
     * Analyse the given lines of script.
     * Should be overridden by subclasses.
     * The base class only contains precondition checking and returns the given input.
     *
     * @param {String[]} scriptlines Lines of script that need to be analysed.
     * @param {Quantity[]} report the quantities of this script with their attributes
     * @pre scriptLines != null
     * @pre scriptLines != undefined
     * @pre report != null
     * @pre report != undefined
     * @return {Quantity[]} a list of quantities with their attributes such as
     * parameters and dependencies.
     */
    AnalyserPass.prototype.analyse = function(scriptLines, report) {
        if (!scriptLines) {
            throw new Error('AnalyserPass.analyse.pre violated :' +
                'scriptLines is null or undefined');
        }
        if (!report) {
            throw new Error('AnalyserPass.analyse.pre violated:' +
                'report is null or undefined');
        }
        return report;
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return AnalyserPass;
});