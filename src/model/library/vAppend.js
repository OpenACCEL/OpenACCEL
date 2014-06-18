/**
 * @memberof Model.Library
 * Returns the array x with y added as last numerical element.
 * This function requires vLen to be loaded.
 * @param  x        array to append to
 * @param  y        element to be appended
 * @return      	array x with y appended to it
 */
function vAppend(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Object) {
        var result = {};
        for (var key in x) {
            result[key] = x[key];
        }
        result[vLen(x)] = y;
        return result;
    } else {
        return [x, y];
    }
}

vAppend.base = [];
