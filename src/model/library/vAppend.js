/**
 * @memberof Model.Library
 * Returns the array x with y added as last numerical element.
 * This function requires vLen to be loaded.
 * @param  x        array to append to
 * @param  y        element to be appended
 * @return      	array x with y appended to it
 */
function vAppend(x, y) {
    if (x instanceof Object) {
        x[vLen(x)] = y;
        return x;
    } else {
        return [x, y];
    }
}

vAppend.base = [];
