/**
 * @memberof Model.Library
 * Returns one of two arguments based on a conditional argument.
 * @param  x		the value to be filled in
 * @param  y		the number of times x is filled in
 * @return result	object containing x y times
 */
function vMake(x, y) {
    result = {};
    for (var i = 0; i < y; i++) {
        result[i] = x;
    }
    return result;
}
