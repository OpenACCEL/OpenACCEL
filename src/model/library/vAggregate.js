//This function was taken from keesvanoverveld.com
function vAggregate(x, y, z) {
    x = objectToArray(x);
    y = objectToArray(y);
    z = objectToArray(z);
    if (x instanceof Array) {
        if (y instanceof Array) {
            if (!(z instanceof Array)) {
                var iLow = Math.min(x.length, Math.max(0, z));
                var r = [];
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
                var iLow = Math.min(x.length, Math.max(0, z));
                var r = [];
                for (i = 0; i < iLow; i++) {
                    r[i] = x[i];
                }
                r[iLow] = y;
                for (i = iLow; i < x.length; i++) {
                    r[i + 1] = x[i];
                }
                return r;
            } else {
                runOK = false;
                throw new Error("vAggregate: third argument must be a scalar.");
                return errOb;
            }
        }
    } else {
        runOK = false;
        throw new Error("vAggregate: first argument must be a vector");
        return errOb;
    }
}
