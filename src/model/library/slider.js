/**
 * Placeholder function for the slider function.
 *
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @memerof Model.Library
 * @pre min <= def <= max
 * @param  {Number} def Deafault value of the slider
 * @param  {Number} min Lower bound
 * @param  {Number} max Upper Bound
 * @return {Array}     Array with def,min,max
 */
function slider(def, min, max) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'Slider' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (isNaN(parseFloat(def)) || isNaN(parseFloat(min)) || isNaN(parseFloat(max))) {
        throw new Error('Arguments of slider must be numeric constants.');
    }

    if (min <= def && def <= max) {
        return [def, min, max];
    } else {
        throw new Error('For the slider, the default value must be between the lower and upper bound.' +
            ' Also the upper bound must be greater than the lower bound' +
            ' (Default = ' + def + ', lower = ' + min + ', upper = ' + max + ')');
    }
}
