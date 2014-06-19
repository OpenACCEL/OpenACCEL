/**
 * @memberof Model.Library
 * Returns an array containing the domain of x.
 * @param  x		array of which the domain should be gotten
 * @return result	array with the domain (keys) of x
 */
function vDom(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        var p = [];
        var key = 0;
        for (i = 0; i < x.length; i++) {
            p.push(i);
        }
        for (key in x) {
            if (isNaN(key)) {
                p.push(key);
            }
        }
        return p;
    } else {
        return [];
    }
}
