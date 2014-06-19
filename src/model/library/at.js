/**
 * @memberof Model.Library
 * Returns the elements in x indexed by y.
 * @param  x		array with values to be gotten
 * @param  y		array with indexes
 * @return 			array with values in x indexed by y
 */
function at(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + '@' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (y instanceof Object) {
        // Recursive step, y is an array
        var result = {};
        for (var key in y) {
            result[key] = at(x, y[key]);
        }
        return result;
    } else {
        // Base: y is a scalar
        if (x instanceof Object) {
            if (x[y] === undefined) {
                return [];
            } else {
                return x[y];
            }
        } else {
            //If x is scalar we simply use x instead of x[y]
            return x;
        }
    }
}
