//This function was taken from keesvanoverveld.com
function vSeq(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    x = objectToArray(x);
    y = objectToArray(y);
    if (!(x instanceof Array) && !(y instanceof Array)) {
        var p = [];
        for (k = x; k < y; k++) {
            p.push(k);
        }
        return p;
    } else {
        return [];
    }
}
