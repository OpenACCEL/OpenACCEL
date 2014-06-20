/**
 * Placeholder function for the input function.
 *
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @memerof Model.Library
 * @param  {Number|String|Boolean} def Default value of input field
 * @return {Array}     Singleton array with def
 */
function input(def) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'input' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return [def];

}

input.isTimeDependent = true;
