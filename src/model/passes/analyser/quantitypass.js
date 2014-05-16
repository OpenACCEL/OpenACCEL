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
            var regex = /([a-zA-Z]\w*)/g;

            // get all variable names from the left hand side
            var vars = lhs.match(regex);

            if (!report) {
                report = {};
            }

            // first entry in vars is the quantity name
            var qtyName = vars[0];
            report[qtyName] = new Quantity();
            report[qtyName].name = qtyName;

            // If there are other items left in vars, then this are the parameters.
            report[qtyName].parameters = vars.slice(1);

        });
    }


    // Exports are needed, such that other modules may invoke methods from this module file.
    return QuantityPass;
});