//This function was taken from keesvanoverveld.com
function vDot(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var a = 0;
    var i;

    if (x instanceof Array) {
        if (y instanceof Array) {
            for (i in x) {
                if (y[i] !== undefined) {
                    if (!(x[i] instanceof Array) && !(y[i] instanceof Array)) {
                        a += (x[i] * y[i]);
                    }
                }
            }
            return a;
        } else {
            for (i in x) {
                if (!(x[i] instanceof Array)) {
                    a += y * x[i];
                }
            }
            return a;
        }
    } else {
        if (!(y instanceof Array)) {
            return x * y;
        } else {
            for (i in y) {
                if (!(y[i] instanceof Array)) {
                    a += x * y[i];
                }
            }
            return a;
        }
    }
}
