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

define(['model/passes/pass'], /**@lends ExePass*/function(Pass) {
    /**
     * @class
     * @classdesc Pass that replaces every reference to variable on the right
     * hand side of a definition by exe.<varname>().
     */
    function ExePass() {}

    ExePass.prototype = new Pass();

    /**
     * Translates the right hand side of a definition,
     * by replacing each references to a variable by
     * exe.<varname>().
     *
     * @param  {String[]} scriptLines Array with script lines
     * @pre scriptLines != null
     * @pre scriptLines != undefined
     * @return {String[]}             Array of translated lines
     */
    ExePass.prototype.parse = function(scriptLines) {
        // Precondition check
        Pass.prototype.parse.call(this, scriptLines);

        var lines = [];
        for (var i = 0; i < scriptLines.length; i++) {
            var line = scriptLines[i];
            var units = this.getUnits(line);

            var result = this.getLHS(line) + // left hand side
            ' = ' +
                this.translateRHS(this.getRHS(line)) + // translated right hand side
            ((units) ? ' ; ' + units : ''); // units if needed

            lines.push(result);
        }
        return lines;
    };

    /**
     * Translates the right hand side of an Accel definition to a macro compatible string.
     * @param  {String} rhs Right hand side of an Accel definitions
     * @pre rhs != null
     * @pre rhs != undefined
     * @return {String}     a macro compatible string.
     */
    ExePass.prototype.translateRHS = function(rhs) {
        if (!rhs) {
            throw new Error('Preprocessor.translateRHS.pre failed. rhs is null or undefined');
        }

        var trimmed = rhs.trim();

        // The regex we use here extracts the definition-variables from the string.
        return trimmed.replace(/\w*[a-zA-Z]\w*\b(?!\()/g, function(s) {
            return 'exe.' + s + '()';
        });
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return ExePass;
});