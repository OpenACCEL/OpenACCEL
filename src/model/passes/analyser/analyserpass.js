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
         * Regex extracting string-definitions
         * @type {RegExp}
         */
        this.stringregex = /(['"])(.*?)(\1)/g;
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

    /**
     * Extracts all Variables, both functions and other Variables, from the given string
     * Does not include dummy variables of quantified expressions
     * 
     * @param  {String} def String to get the Variables from
     * @return {Sting[]}     Array of quantity names
     */
    AnalyserPass.prototype.getVariables = function(s) {
        var regexvar = new RegExp(this.regexes.variables);
        s = s.replace(this.stringregex, ""); // remove string definitions
        var dummies = this.getDummies(s); // determine dummies
        var match;
        var output = [];
        while (match = regexvar.exec(s)) {
            if (dummies.indexOf(match[1]) == -1) {
                output.push(match[1]);
            }
        }
        return output;
    };

    /**
     * Extracts all dummy variables (the ones in quantified expressions), from the given string
     * @param  {String} def String to get the dummies from
     * @return {Sting[]}     Array of quantity names
     */
    AnalyserPass.prototype.getDummies = function(s) {
        var regexdum = new RegExp(this.regexes.dummies);
        s = s.replace(this.stringregex, ""); // remove string definitions
        var dummies = []; // determine dummies
        var match;
        while (match = regexdum.exec(s)) {
            dummies.push(match[1]);
        }

        return dummies;
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return AnalyserPass;
});
