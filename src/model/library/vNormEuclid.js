//This function was taken from keesvanoverveld.com
function vNormEuclid(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    x = objectToArray(x);
    if (x instanceof Array) {
        var a = 0;
        for (i in x) {
            if (!(x[i] instanceof Array)) {
                a += x[i] * x[i];
            }
        }
        return Math.sqrt(a);
    } else {
        return Math.abs(x);
    }
}
