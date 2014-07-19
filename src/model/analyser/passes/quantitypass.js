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

define(['underscore', 'model/analyser/passes/analyserpass', 'model/quantity'],
        /**@lends Model.Analyser.Passes*/
        function(_, AnalyserPass, Quantity) {
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

        // get all variable names from the left hand side
        var vars = this.getVariables(lhs);

        // first entry in vars is the quantity name
        var qtyName = vars[0];
        var qty;

        // Existing quantity is redefined. We have to make sure to keep the reverse dependencies
        // of _this_ quantity, but remove this quantity from all reverse dependency lists of
        // it's dependencies
        if (qtyName in quantities) {
            qty = quantities[qtyName];
            qty.LHS = lhs;
            qty.source = line;
            qty.definition = rhs;
            qty.todo = false;
            qty.unit = this.getUnits(line);

            // If there are other items left in vars, then this are the parameters.
            qty.parameters = vars.slice(1);

            // Check whether qty is time-dependent
            qty.isTimeDependent = isTimeDependent(qty);

            // Remove the redefined quantity from reverse dependencies and delete all reverse
            // dependencies that are todo and don't have any other reverse dependencies
            for (var dep in qty.dependencies) {
                var d = quantities[qty.dependencies[dep]];

                if (d.todo) {
                    if (_.size(d.reverseDeps) <= 1) {
                        // We are the only quantity depending on it, so delete it
                        delete quantities[d.name];
                    } else {
                        // Remove us from reverse-dependency array
                        d.reverseDeps = _.without(d.reverseDeps, qtyName);
                    }
                } else {
                    // Remove us from reverse-dependency array
                    d.reverseDeps = _.without(d.reverseDeps, qtyName);
                }

            }
        }

        else {
            // Create new quantity and add it to the quantities
            qty = new Quantity();
            qty.name = qtyName;
            qty.LHS = lhs;
            qty.source = line;
            qty.definition = rhs;
            qty.unit = this.getUnits(line);

            // Straightforward check for empty definitions of quantities. Further
            // checking of todo-items is done in the dependency pass.
            if (rhs == '') {
                qty.todo = true;
            } else {
                qty.todo = false;
            }

            // If there are other items left in vars, then this are the parameters.
            qty.parameters = vars.slice(1);

            // Check whether qty is time-dependent
            qty.isTimeDependent = isTimeDependent(qty);

            // Add to quantities
            quantities[qtyName] = qty;
        }

        return qty;
    };

    function isTimeDependent(qty) {
        // Check whether qty.definition contains a history operator
        if (qty.definition.indexOf("{") >= 0) {
            return true;
        }

        // check whether qty.definition contains a time dependent function
        // Do NOT edit the line below. Placeholder will be automatically replaced at build time.
        var timeDependencies = ["slider", "check", "button", "input", "getTime", "random", "cursorX", "cursorY", "cursorB"];
        for (var i = timeDependencies.length - 1; i >= 0; i--) {
            if (qty.definition.indexOf(timeDependencies[i]) >= 0) {
                return true;
            }
        }

        return false;
    }

    // Exports are needed, such that other modules may invoke methods from this module file.
    return QuantityPass;
});
