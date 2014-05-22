/*
 * File containing the ExePass class
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

define(['model/passes/preprocessor/compilerpass'], /**@lends ExePass*/ function(CompilerPass) {
    /**
     * @class
     * @classdesc Pass that replaces every reference to variable on the right
     * hand side of a definition by exe.<varname>().
     */
    function ExePass() {}

    ExePass.prototype = new CompilerPass();

    /**
     * Translates the right hand side of a definition,
     * by replacing each references to a variable by
     * exe.<varname>().
     *
     * @param {String[]}    scriptLines Array with script lines.
     * @param {Report}      report A full report containing script information.
     * @pre scriptLines != null
     * @pre scriptLines != undefined
     * @pre report != null
     * @pre report != undefined
     * @return {String[]}             Array of translated lines
     */
    ExePass.prototype.parse = function(scriptLines, report) {
        // Precondition check
        CompilerPass.prototype.parse.call(this, scriptLines, report);

        var lines = [];
        for (var i = 0; i < scriptLines.length; i++) {
            var line = scriptLines[i];
            var units = this.getUnits(line);

            var result = this.getLHS(line) + // left hand side
            ' = ' +
                this.translateRHS(this.getRHS(line), this.getLHS(line), report) + // translated right hand side
            ((units) ? ' ; ' + units : ''); // units if needed

            lines.push(result);
        }
        return lines;
    };

    /**
     * Translates the right hand side of an Accel definition to a macro compatible string.
     * @param  {String} rhs Right hand side of an Accel definitions
     * @param  {String} lhs Left hand side of an Accel definitions
     * @pre rhs != null
     * @pre rhs != undefined
     * @return {String}     a macro compatible string.
     */
    ExePass.prototype.translateRHS = function(rhs, lhs, report) {
        if (!rhs) {
            throw new Error('Preprocessor.translateRHS.pre failed. rhs is null or undefined');
        }

        var output = rhs.trim();

        /*
         * For user defined functions, like 'f(a) = 2 + a + x', we want dont want this pass to modify the 'a' on the rhs.
         * So what we do, is we first detect if the left hand side is a user defined function. If this is the case, we
         * use the same regex to find the local variables (like 'a'), and skip those regex matches on the rhs transformation.
         */

        // Get a list of all user defined functions.
        var userDefinedFunctions = [];
        for (var key in report) {
            if (report[key].name && report[key].parameters.length > 0) {
                userDefinedFunctions.push(report[key].name);
            }
        }

        // Put .exe before any user-defined function.
        output = output.replace(this.regexes.function, function(s) {
            // If a found function is a user-defined function, put .exe in front of it.
            if (userDefinedFunctions.indexOf(s) > -1) {
                return 'exe.' + s;
            }

            return s;
        });

        // The regex we use here extracts the definition-variables from the string.
        return output.replace(this.regexes.identifier, function(s) {
            // Check if this variable is not a local function variable.
            var parameters = report[lhs.match(/([a-zA-Z]\w*)/)[0]].parameters;
            if (parameters.indexOf(s) > -1 || s == "exe") {
                return s;
            }

            // We may have the case where the regex matches 'myVar.myKey'.
            // We only want to modify the first part, thus we split by . and only edit the first element.

            var split = s.split(".");
            var newQuantityName = 'exe.' + split[0] + '()';

            if (split.slice(1).length > 0) {
                newQuantityName += "." + split.slice(1).join(".");
            }
            
            return newQuantityName;
        });
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return ExePass;
});
