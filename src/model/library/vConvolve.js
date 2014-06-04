//This function was taken from keesvanoverveld.com
function vConvolve(x, y, n, m) {
    x = __objectToArray__(x);
    y = __objectToArray__(y);
    if (x instanceof Array) {
        var r = x.length;
        if (y instanceof Array) {
            var p = y.length;
            if (!(n instanceof Array)) {
                var n = Math.round(n);
                var res = [];
                switch (m) {
                    case 0:
                        for (i = 0; i < r; i++) {
                            var rr = 0;
                            for (j = 0; j < p; j++) {
                                var index = i + j - n;
                                while (index < 0)
                                    index += r;
                                while (index >= r)
                                    index -= r;
                                rr += x[index] * y[j];
                            }
                            res[i] = rr;
                        }
                        return res;
                        break;
                    case 1:
                        for (i = 0; i < r; i++) {
                            var rr = 0;
                            for (j = 0; j < p; j++) {
                                var index = i + j - n;
                                if (index >= 0 && index < r) {
                                    rr += x[index] * y[j];
                                }
                            }
                            res[i] = rr;
                        }
                        return res;
                        break;
                    case 2:
                        for (i = 0; i < r; i++) {
                            var rr = 0;
                            for (j = 0; j < p; j++) {
                                var index = i + j - n;
                                index = index < 0 ? 0 : (index >= r ? r - 1 : index);
                                rr += x[index] * y[j];

                            }
                            res[i] = rr;
                        }
                        return res;
                        break;
                    default:
                        runOK = false;
                        errorString += "\nconvolution: fourth argument must be 0, 1 or 2.";
                        return errOb;
                        break;
                }
            } else {
                runOK = false;
                errorString += "\nconvolution: auto-mapping is not supported, third argument must be scalar.";
                return errOb;
            }
        } else {
            return [];
        }
    } else {
        return [];
    }
}
