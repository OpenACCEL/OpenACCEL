//This function was taken from keesvanoverveld.com
function vNormalize(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    var a = 0;
    if (x instanceof Array) {
        for (i in x) {
            if (!(x[i] instanceof Array)) {
                a += x[i] * x[i];
            }
        }
        var nn = Math.sqrt(a);
        var rr = [];
        if (nn > 0) {
            for (i in x) {
                if (!(x[i] instanceof Array)) {
                    rr[i] = x[i] / nn;
                } else {
                    rr[i] = x[i];
                }
            }
        } else {
            for (i in x) {
                if (!(x[i] instanceof Array)) {
                    rr[i] = 0;
                } else {
                    rr[i] = x[i];
                }
            }
        }
        return rr;
    } else {
        return 1;
    }
}
