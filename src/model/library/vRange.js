//This function was taken from keesvanoverveld.com
function vRange(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    x = objectToArray(x);
    if (x instanceof Array) {
        var p = [];
        for (k in x) {
            p.push(x[k]);
        }
        return p;
    } else {
        return [x];
    }
}
