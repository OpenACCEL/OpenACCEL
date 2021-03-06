/*
 * The dependency Pass retrieves the dependencies from the script for each of the quantities.
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

define(['Model/Analyser/Passes/AnalyserPass', 'Model/Quantity', 'Model/Library'], /**@lends Model.Analyser.Passes*/ function(AnalyserPass, Quantity, Library) {
    /**
     * @class
     * @classdesc This pass is part of the Script Analyser and extracts:
     *  -Dependencies of quantities: on which quantities the value of a
     *   certain quantity depends
     *  -Reverse dependencies: which quantities depend on the quantity being defined
     *  -Whether a quantity has been given a definition already, or is a 'todo-item'
     */
    function DependencyPass() {
        this.lib = new Library();
        this.reservedwords = this.lib.getFunctions({'all':true, 'escaped':false});
        this.reserved = this.lib.getFunctions({'reserved': true});
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
    DependencyPass.prototype.analyse = function(line, quantity, quantities) {
        // Reset dependencies array in case we're redefining a quantity
        quantity.dependencies = [];
        quantity.nonhistDeps = [];

        // First get all non-history variable names from the right hand side
        var deps = this.getNonHistoryVariables(quantity.definition);

        // Identify all non-history dependencies and add them to the quantities
        var dep, d;
        for (dep in deps) {
            d = deps[dep];

            // It could be that the dependent variable is not yet in the quantities because
            // it has not been defined yet. Therefore, instead test whether the variable
            // is local to this definition and if not, add it as a dependency. Also, a single
            // variable can occur multiple times in the rhs of a definition. Check this
            // as well.
            if (quantity.parameters.indexOf(d) === -1 &&
                quantity.nonhistDeps.indexOf(d) === -1 &&
                this.reservedwords.indexOf(d) === -1) {

                quantity.nonhistDeps.push(d);

                // It could be that it is used in multiple definitions while being
                // undefined. Therefore only add it if it's not already there
                if (!quantities[d]) {
                    quantities[d] = new Quantity();
                    quantities[d].markAsTodo(d);
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

                // Add the quantity being defined as a reverse non-history dependency of this quantity
                if (!quantities[d].reverseNonhistDeps) {
                    quantities[d].reverseNonhistDeps = [];
                    quantities[d].reverseNonhistDeps.push(quantity.name);
                } else {
                    if (quantities[d].reverseNonhistDeps.indexOf(quantity.name) == -1) {
                        quantities[d].reverseNonhistDeps.push(quantity.name);
                    }
                }
            } else if (this.reservedwords.indexOf(d) > -1 && this.reserved.indexOf(d) === -1 && quantity.stdfuncs.indexOf(d) === -1) {
                quantity.stdfuncs.push(d);
            }
        }

        // Clone dependencies into 'master' dependency array
        quantity.dependencies = quantity.nonhistDeps.slice(0);

        deps = this.getHistoryVariables(quantity.definition);
        for (dep in deps) {
            d = deps[dep];

            // It could be that the dependent variable is not yet in the quantities because
            // it has not been defined yet. Therefore, instead test whether the variable
            // is local to this definition and if not, add it as a dependency. Also, a single
            // variable can occur multiple times in the rhs of a definition. Check this
            // as well.
            if (quantity.parameters.indexOf(d) === -1 &&
                quantity.dependencies.indexOf(d) === -1 &&
                this.reservedwords.indexOf(d) === -1) {

                quantity.dependencies.push(d);

                // It could be that it is used in multiple definitions while being
                // undefined. Therefore only add it if it's not already there
                if (!quantities[d]) {
                    quantities[d] = new Quantity();
                    quantities[d].markAsTodo(d);
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
            } else if (this.reservedwords.indexOf(d) > -1 && this.reserved.indexOf(d) === -1 && quantity.stdfuncs.indexOf(d) === -1) {
                quantity.stdfuncs.push(d);
            }
        }

        return quantity;
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return DependencyPass;
});
