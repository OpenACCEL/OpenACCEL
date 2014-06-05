//This function was taken from keesvanoverveld.com
function vVecRamp(x, y, z) {
    x = __objectToArray__(x);
    y = __objectToArray__(y);
    z = __objectToArray__(z);
    // arguments: x is a vector of abcissae
    // y is a vector of ordinates
    // z is an abcissa-value
    if (x instanceof Array) {
        if (y instanceof Array) {
            if (!(z instanceof Array)) {
                // simply ignore elements at the tail in case on of the two vectors is too long
                var len = Math.min(x.length, y.length);
                // it may be necessary to sort the keys - hopefully not, but it takes
                // little time at least to check
                var sorted = false;
                var scalarOK = true;
                while (!sorted && scalarOK) {
                    sorted = true;
                    for (i = 0; i < len - 1; i++) {
                        if (!(x[i] instanceof Array)) {
                            if (!(x[i + 1] instanceof Array)) {
                                if (x[i] > x[i + 1]) {
                                    var swap = x[i];
                                    x[i] = x[i + 1];
                                    x[i + 1] = swap;
                                    // don't forget to swap the ordinate values as well!
                                    swap = y[i];
                                    y[i] = y[i + 1];
                                    y[i + 1] = swap;
                                    sorted = false;
                                }
                            } else
                                scalarOK = false;
                        } else
                            scalarOK = false;
                    }
                }
                if (scalarOK) {
                    //first do a binary search - assume that the keys are sorted!
                    //We have to find the index i such that the probe is enclosed between heap(i) and heap(i+1).
                    var lo = 0;
                    var hi = len;
                    var mi = len / 2;
                    if (z <= x[0]) {
                        return y[0];
                    }
                    if (z >= x[len - 1]) {
                        return y[len - 1];
                    }
                    var nrtrials = 0;
                    while (hi > lo + 1 && nrtrials < 20) {
                        mi = Math.round((hi + lo) / 2)
                        if (z >= x[mi])
                            lo = mi;
                        if (z <= x[mi])
                            hi = mi;
                        nrtrials++;
                    }
                    if (nrtrials < 20) {
                        if (x[lo + 1] > x[lo]) {
                            return y[lo] + (z - x[lo]) * (y[lo + 1] - y[lo]) / (x[lo + 1] - x[lo]);
                        } else {
                            return 0.5 * (y[lo] + y[lo + 1]);
                        }
                    } else {
                        throw new Error("vVecRamp: could not find enclosing interval for abcissa.");
                    }
                } else {
                    throw new Error("vVecRamp: not all the abcissae values are scalar.");
                }
            } else {
                throw new Error("vVecRamp: third argument of vVecRamp must be scalar (abcissa-value).");
            }
        } else {
            throw new Error("vVecRamp: second argument of vVecRamp must be vector (of ordinates).");
        }
    } else {
        throw new Error("vVecRamp: first argument of vVecRamp must be vector (of abcissae).");
    }
}
