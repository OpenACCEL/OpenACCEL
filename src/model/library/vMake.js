/**
 * @memberof Model.Library
 * Returns an array consisting of y instances of x.
 * @param  x		the value to be filled in
 * @param  y		the number of times x is filled in
 * @return result	object containing x y times
 */
function vMake(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    result = [];
    for (var i = 0; i < y; i++) {
        result[i] = x;
    }
    return result;
}
