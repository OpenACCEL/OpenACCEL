/**
 * Placeholder function for the button function.
 *
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @memberof Model.Library
 * @return {Array}     Empty array
 */
function button() {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'button' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return [];
}

button.isTimeDependent = true;
