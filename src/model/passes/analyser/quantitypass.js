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

define(['model/passes/analyser/analyserpass', 'model/quantity'], /**@lends Model.Passes.Analyser*/ function(AnalyserPass, Quantity) {
    /**
     * @class
     * @classdesc This pass is part of the Analyser and extracts:
     * 	-Quantity names
     *	-Parameters of user-defined functions
     *	-Whether quantities have a definition or not
     */
    function QuantityPass() {

    }

    QuantityPass.prototype = new AnalyserPass();

    /**
     * Determines the quantity being defined in the given line of script,
     * along with any parameters.
     *
     * @param line {String} The line of ACCEL code in which a quantity is defined
     * @param quantity {Quantity} Unused, can be null
     * @param quantities {Object} The current quantities in the script.
     * @modifies quantity, quantities
     * @post quantity in quantities
     * @return A Quantity object representing the quantity which is defined in line.
     */
    QuantityPass.prototype.analyse = function(line, quantity, quantities) {
        if (!quantities) {
            throw new Error('QuantityPass.analyse.pre violated:' +
                'quantities is null or undefined');
        }

        // Left and right hand sides of the definition
        var lhs = this.getLHS(line);
        var rhs = this.getRHS(line);

        // Get all variable names from the left hand side
        var vars = lhs.match(this.regexes.varNames);
        var qtyName = vars[0];
        var qty;

        // If the quantity already exists, update it instead of creating a new one
        // to preserve reverse dependencies!
        if (qtyName in quantities) {
            qty = quantities[qtyName];
            qty.LHS = lhs;
            qty.source = line;
            qty.definition = rhs;
            qty.todo = false;
            
            // If there are other items left in vars, then this are the parameters.
            qty.parameters = vars.slice(1);
        } else {
            // Create new quantity and add it to the quantities
            qty = new Quantity();
            qty.name = qtyName;
            qty.LHS = lhs;
            qty.source = line;
            qty.definition = rhs;

            // Straightforward check for empty definitions of quantities. Further 
            // checking of todo-items is done in the dependency pass.
            if (rhs == '') {
                qty.todo = true;
            } else {
                qty.todo = false;
            }
            
            // If there are other items left in vars, then this are the parameters.
            qty.parameters = vars.slice(1);

            // Add to quantities
            quantities[qtyName] = qty;
        }

        return qty;
    };


    // Exports are needed, such that other modules may invoke methods from this module file.
    return QuantityPass;
});
