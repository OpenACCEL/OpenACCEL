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
    function DependencyPass() {}

    DependencyPass.prototype = new AnalyserPass();

    /**
     * @Override
     * Determines the dependencies for each quantity
     */
    DependencyPass.prototype.analyse = function(scriptLines, report) {
        // Handle each line of script
        scriptLines.forEach(function(line) {
            // left and right hand side of the definitions
            var lhs = DependencyPass.prototype.getLHS(line);
            var rhs = DependencyPass.prototype.getRHS(line);

            // regex that selects all variable names from a definition
            var regex = /([a-zA-Z]\w*)/g;

            // get the quantity for which we determine the dependencies
            var qty = lhs.match(/([a-zA-Z]\w*)/)[0];

            // get all variable names from the right hand side
            var dep = rhs.match(regex);

            if (!report[qty].dependencies) {
                report[qty].dependencies = [];
            }

            // add all dependencies
            if (dep) {
                dep.forEach(function(d) {
                    if (report[d]) {
                        report[qty].dependencies.push(d);
                    }
                });
            }


        });
        return report;

    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return DependencyPass;
});
