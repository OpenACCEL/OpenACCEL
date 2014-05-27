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

define(['model/passes/preprocessor/compilerpass'], /**@lends Model.Passes.Preprocessor*/ function(CompilerPass) {
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
     * @param {Object}      report A full report containing script information.
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
        var qty = lhs.match(/\w*[a-zA-z_]\w*/)[0]; // the quantity we are evaluating
        // place exe. before each user defined function
        output = output.replace(this.regexes.function, function(s) {
            // a function is found, check if this variable depends on it.
            if (report[qty].dependencies.indexOf(s) > -1) {
                return 'exe.' + s;
            }

            return s;
        });


        // place exe. before, and () after athe quantities that this variable depends on.
        output = output.replace(this.regexes.identifier, function(s) {
            // a quantiy is found, check if this variable depends on it.
            if (report[qty].dependencies.indexOf(s) > -1) {
                return 'exe.' + s +'()';
            }

            return s;
        });
        
        return output;
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return ExePass;
});
