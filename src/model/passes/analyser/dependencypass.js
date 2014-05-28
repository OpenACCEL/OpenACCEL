/*
 * The dependency Pass retrieves the dependencies from the script for each of the
 * quantities.
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

define(['model/passes/analyser/analyserpass', 'model/quantity', 'model/functionList'], /**@lends Model.Passes.Analyser*/ function(AnalyserPass, Quantity, FunctionList) {
    /**
     * @class
     * @classdesc This pass is part of the Script Analyser and extracts:
     *  -Dependencies of quantities: on which quantities the value of a 
     *   certain quantity depends
     *  -Reverse dependencies: which quantities depend on the quantity being defined
     *  -Whether a quantity has been given a definition already, or is a 'todo-item'
     */
    function DependencyPass() {
        this.functionlist = FunctionList.getList();
    }

    DependencyPass.prototype = new AnalyserPass();

    /**
     * Determines the dependencies of the given quantity
     *
     * @param line {String} The line of ACCEL code containing the definition of quantity
     * @param quantity {Quantity} The Quantity of which to determine the dependencies
     * @param quantities {Object} The current quantities in the script.
     * @return A Quantity object with filled in dependency information/data.
     */
    DependencyPass.prototype.analyse = function(line, quantities) {
        // Reset quantities array
        quantity.dependencies = [];

        // left and right hand side of the definitions
        var lhs = this.getLHS(line);
        var rhs = this.getRHS(line);

        // get the quantity for which we determine the dependencies
        var qty = this.getVariables(lhs)[0];

        // get all variable names from the right hand side
        var dep = this.getVariables(rhs);
        
        if (!quantities[qty].dependencies) {
            quantities[qty].dependencies = [];
        }

        // Identify all dependencies and add them to the quantities
        if (dep) {
            dep.forEach((function(d) {
                // It could be that the dependent variable is not yet in the quantities because
                // it has not been defined yet. Therefore, instead test whether the variable
                // is local to this definition and if not, add it as a dependency. Also, a single
                // variable can occur multiple times in the rhs of a definition. Check this
                // as well.
                if (quantity.parameters.indexOf(d) == -1 && quantity.dependencies.indexOf(d) == -1 && this.functionlist.indexOf(d) == -1) {
                    quantity.dependencies.push(d);
                    
                    // It could be that it is used in multiple definitions while being
                    // undefined. Therefore only add it if it's not already there 
                    if (!quantities[d]) {
                        quantities[d] = new Quantity();
                        quantities[d].name = d;
                        quantities[d].todo = true;
                        quantities[d].source = d + '=';
                    }

                    // Add the quantity being defined as a reverse dependency of this quantity
                    if (!quantities[d].reverseDeps) {
                        quantities[d].reverseDeps = [];
                        quantities[d].reverseDeps.push(quantity.name);
                    } else {
                        if (quantities[d].reverseDeps.indexOf(quantity.name) == -1) {
                            quantities[d].reverseDeps.push(quantity.name);
                        }
                    }
                }
            }).bind(this));
        }

        return quantity;
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return DependencyPass;
});
