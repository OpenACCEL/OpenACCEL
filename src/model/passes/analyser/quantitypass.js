/*
 * File containing the QuantityPass class
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

define(['model/passes/analyser/analyserpass', 'model/quantity'], /**@lends ExePass*/ function(AnalyserPass, Quantity) {
    /**
     * @class
     * @classdesc Abstract Pass that is part of compiling the script.
     */
    function QuantityPass() {}

    QuantityPass.prototype = new AnalyserPass();

    /**
     * @Override
     * Determines the quantities that are present in the script
     */
    QuantityPass.prototype.parse = function(scriptLines, report) {
        scriptLines.forEach(function(line) {
            // left hand side of the definitions
            var lhs = this.getLHS(line);

            // regex that selects all variable names from the left hand side
            var regex = /([a-zA-Z]+[0-9]*)/g;

            // get all variable names from the left hand side
            var vars = lhs.match(regex);


        });
    }


    // Exports are needed, such that other modules may invoke methods from this module file.
    return QuantityPass;
});