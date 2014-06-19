/**
 * Placeholder function for the check function.
 *
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @memerof Model.Library
 * @param  {Boolean} def default value of the checkbox
 * @return {Array}     Singleton array with def
 */
function check(def) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'check' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (typeof def === 'boolean') {
        return [def];
    } else {
        throw new Error('Argument of check must be true or false');
    }
}
