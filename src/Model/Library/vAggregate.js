//This function was taken from keesvanoverveld.com
function vAggregate(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var iLow, r;
        if (y instanceof Array) {
            if (!(z instanceof Array)) {
                iLow = Math.min(x.length, Math.max(0, z));
                r = [];
                for (i = 0; i < iLow; i++) {
                    r[i] = x[i];
                }
                for (i = 0; i < y.length; i++) {
                    r[i + iLow] = y[i];
                }
                for (i = iLow; i < x.length; i++) {
                    r[i + y.length] = x[i];
                }
                return r;
            } else {
                throw new Error("vAggregate: third argument must be a scalar.");
            }
        } else {
            // we interpret the scala element to be inserted as if it is a vector with length 1
            if (!(z instanceof Array)) {
                iLow = Math.min(x.length, Math.max(0, z));
                r = [];
                for (i = 0; i < iLow; i++) {
                    r[i] = x[i];
                }
                r[iLow] = y;
                for (i = iLow; i < x.length; i++) {
                    r[i + 1] = x[i];
                }
                return r;
            } else {
                throw new Error("vAggregate: third argument must be a scalar.");
            }
        }
    } else {
        throw new Error("vAggregate: first argument must be a vector");
    }
}
