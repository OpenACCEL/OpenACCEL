//This function was taken from keesvanoverveld.com
function vSegment(x) {
    x = __objectToArray__(x);
    if (x instanceof Array) {
        if (!(y instanceof Array)) {
            if (!(z instanceof Array)) {
                var iLow = Math.max(0, y);
                var iHi = Math.min(x.length, z);
                var r = [];
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
                runOK = false;
                errorString += "\nvSegment: third argument must be a scalar.";
                return errOb;
            }
        } else {
            runOK = false;
            errorString += "\nvSegment: second argument must be a scalar.";
            return errOb;
        }
    } else {
        runOK = false;
        errorString += "\nvSegment: first argument must be a vector.";
        return errOb;
    }
}