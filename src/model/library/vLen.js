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
    if (!(x instanceof Object)) {
        return 0;
    }
    var keys = Object.keys(x);
    var current;
    //Find the maximum numerical index
    //This uses the assumption that Object.keys alwyas puts all numerical keys first and in sequence.
    for (var i = keys.length - 1; i >= 0; i--) {
        current = parseInt(keys[i]);
        if (!isNaN(current)) {
            return current + 1;
            break;
        }
    }
    return 0;
}
