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

define(['model/passes/analyser/analyserpass'], /**@lends ExePass*/ function(AnalyserPass) {
    /**
     * @class
     * @classdesc Abstract Pass that is part of compiling the script.
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

            // add all dependencies
            if (dep) {
                dep.forEach(function(d) {
                    if (report[d] && (report[qty].parameters.indexOf(d) == -1) && (report[qty].dependencies.indexOf(d) == -1)) {
                        // d is a defined quantity, it is not a parameter and we have not yet encountered it 
                        report[qty].dependencies.push(d);
                    }
                });
            }


        }).bind(this));
        return report;

    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return DependencyPass;
});
