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
    x = objectToArray(x);
    y = objectToArray(y);

    var p = [];
    if (!(x instanceof Array)) {
        p.push(x);
    } else {
        for (k in x) {
            p.push(x[k]);
        }
    }
    if (!(y instanceof Array)) {
        p.push(y);
    } else {
        for (k in y) {
            p.push(y[k]);
        }
    }
    return p;
}

vConcat.base = [];
