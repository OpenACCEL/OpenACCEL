//This function was taken from keesvanoverveld.com
function vSegment(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        if (!(y instanceof Array)) {
            if (!(z instanceof Array)) {
                var iLow = Math.max(0, y);
                var iHi = Math.min(x.length, z);
                var r = [];
                var i;
                for (i = iLow; i < iHi; i++) {
                    r[i - iLow] = x[i];
                }
                i = iHi - iLow;
                while (i < z - y) {
                    r[i] = 0;
                    i++;
                }
                return r;
            } else {
                throw new Error("vSegment: third argument must be a scalar.");
            }
        } else {
            throw new Error("vSegment: second argument must be a scalar.");
        }
    } else {
        throw new Error("vSegment: first argument must be a vector.");
    }
}
