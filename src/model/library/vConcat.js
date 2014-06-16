/**
 * @memberof Model.Library
 * Returns the concatination of arrays x and y.
 * Named indices are concatinated as if they were numerical indices above the maximum of the original array.
 * This function requires vLen to be loaded.
 * @param  x        the front array to be concatinated to
 * @param  y        the back array to concatinate
 * @return result 	concatination of arrays x and y
 */
function vConcat(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    var result = {};
    var base = 1;
    var keys;
    if (x instanceof Object) {
        keys = Object.keys(x);
        base = keys.length;
        for (var i = keys.length - 1; i >= 0; i--) {
            result[i] = x[keys[i]];
        }
    } else {
        result[0] = x;
    }
    if (y instanceof Object) {
        keys = Object.keys(y);
        for (var i = keys.length - 1; i >= 0; i--) {
            result[base + i] = y[keys[i]];
        }
    } else {
        result[base] = y;
    }
    return result;
}
