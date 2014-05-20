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
     * @classdesc This pass is part of the Script Analyser and extracts:
     * 	-Quantity names
     *	-Parameters of user-defined functions
     *	-Whether quantities have a definition or not
     */
    function QuantityPass() {

    }

    QuantityPass.prototype = new AnalyserPass();

    /**
     * @Override
     * Determines the quantities that are present in the script
     */
    QuantityPass.prototype.analyse = function(scriptLines, report) {
        // Handle each line of script
        scriptLines.forEach((function(line) {
            // left hand side of the definitions
            var lhs = QuantityPass.prototype.getLHS(line);
            var rhs = QuantityPass.prototype.getRHS(line);

            // get all variable names from the left hand side
            var vars = lhs.match(this.regexes.varNames);

			// Create report if it doesn't already exist
            if (!report) {
                report = {};
            }

            // first entry in vars is the quantity name
            var qtyName = vars[0];
            report[qtyName] = new Quantity();
            report[qtyName].name = qtyName;

            // If there are other items left in vars, then this are the parameters.
            report[qtyName].parameters = vars.slice(1);
            report[qtyName].definition = rhs;
            
            // Straightforward check for empty definitions of quantities. Further 
            // identification of todo-items is done in the dependency pass.
            if (rhs == '') {
            	report[qtyName].todo = true;
            }

        }).bind(this));
        return report;
    };


    // Exports are needed, such that other modules may invoke methods from this module file.
    return QuantityPass;
});