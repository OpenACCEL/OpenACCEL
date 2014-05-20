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

define(['model/passes/analyser/analyserpass', 'model/quantity'], /**@lends ExePass*/ function(AnalyserPass, Quantity) {
    /**
     * @class
     * @classdesc This pass is part of the Script Analyser and extracts:
     * 	-Dependencies of quantities: on which quantities the value of a 
     *	 certain quantity depends
     *	-Whether a quantity has been given a definition already, or is a 'todo-item'
     */
    function DependencyPass() {

    }

    DependencyPass.prototype = new AnalyserPass();

    /**
     * @Override
     * Determines the dependencies for each quantity
     */
    DependencyPass.prototype.analyse = function(scriptLines, report) {
        // Handle each line of script
        scriptLines.forEach((function(line) {
            // left and right hand side of the definitions
            var lhs = DependencyPass.prototype.getLHS(line);
            var rhs = DependencyPass.prototype.getRHS(line);

            // get the quantity for which we determine the dependencies
            var qty = lhs.match(this.regexes.varNames)[0];

            // get all variable names from the right hand side
            var dep = rhs.match(this.regexes.varNames);

            if (!report[qty].dependencies) {
                report[qty].dependencies = [];
            }

            // Identify all dependencies and add them to the quantities
            if (dep) {
                dep.forEach(function(d) {
                	// It could be that the dependent variable is not yet in the report because
                	// it has not been defined yet. Therefore, instead test whether the variable
                	// is local to this definition and if not, add it as dependency
                	if (lhs.indexOf(d) == -1) {
                		report[qty].dependencies.push(d);
                		
                		// It could be that it is used in multiple definitions while being
                		// undefined. Therefore only add it if it's not already there 
                		if (!report[d]) {
                			report[d] = new Quantity();
                			report[d].name = d;
                			report[d].todo = true;
                		}
                	}
                });
            }


        }).bind(this));
        return report;

    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return DependencyPass;
});
