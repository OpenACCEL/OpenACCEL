 //This function was taken from keesvanoverveld.com
function vConvolve(x, y, n, m) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
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
                        throw new Error("convolution: fourth argument must be 0, 1 or 2.");
                }
            } else {
                throw new Error("convolution: auto-mapping is not supported, third argument must be scalar.");

            }
        } else {
            return [];
        }
    } else {
        return [];
    }
}
