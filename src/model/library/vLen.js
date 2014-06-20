/**
 * @memberof Model.Library
 * Returns a the length of array x, not including non-numerical indices.
 * @param  x		array of which the length should be gotten
 * @return      	length of array x, numerical indices only
 */
function vLen(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (!(x instanceof Array)) {
        return 0;
    }
    return x.length;
}
