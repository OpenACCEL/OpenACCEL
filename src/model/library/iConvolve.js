//This function was taken from keesvanoverveld.com
function iConvolve(x,y,n1,n2,m) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var r1 = x.length;
        if (x[0] instanceof Array) {
            var r2 = x[0].length;
            if (y instanceof Array) {
                var p1 = y.length;
                if (y[0] instanceof Array) {
                    var p2 = y[0].length;
                    if (!(n1 instanceof Array) && !(n2 instanceof Array)) {
                        n1 = Math.round(n1);
                        n2 = Math.round(n2);
                        var res = [];
                        var index1, index2;
                        switch (m) {
                            case 0:
                                for (i = 0; i < r1; i++) {
                                    res[i] = [];
                                    for (ii = 0; ii < r2; ii++) {
                                        res[i][ii] = 0;
                                        for (j = 0; j < p1; j++) {
                                            index1 = i + j - n1;
                                            while (index1 < 0)
                                                index1 += r1;
                                            while (index1 >= r1)
                                                index1 -= r1;
                                            for (jj = 0; jj < p2; jj++) {
                                                index2 = ii + jj - n2;
                                                while (index2 < 0)
                                                    index2 += r2;
                                                while (index2 >= r2)
                                                    index2 -= r2;
                                                res[i][ii] += x[index1][index2] * y[j][jj];
                                            }
                                        }
                                    }
                                }
                                return res;
                            case 1:
                                for (i = 0; i < r1; i++) {
                                    res[i] = [];
                                    for (ii = 0; ii < r2; ii++) {
                                        res[i][ii] = 0;
                                        for (j = 0; j < p1; j++) {
                                            index1 = i + j - n1;
                                            for (jj = 0; jj < p2; jj++) {
                                                index2 = ii + jj - n2;
                                                if (index1 >= 0 && index1 < r1) {
                                                    if (index2 >= 0 && index2 < r2) {
                                                        res[i][ii] += x[index1][index2] * y[j][jj];
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                return res;
                            case 2:
                                for (i = 0; i < r1; i++) {
                                    res[i] = [];
                                    for (ii = 0; ii < r2; ii++) {
                                        res[i][ii] = 0;
                                        for (j = 0; j < p1; j++) {
                                            index1 = i + j - n1;
                                            index1 = index1 < 0 ? 0 : index1 >= r1 ? r1 - 1 : index1;
                                            for (jj = 0; jj < p2; jj++) {
                                                index2 = ii + jj - n2;
                                                index2 = index2 < 0 ? 0 : index2 >= r2 ? r2 - 1 : index2;
                                                res[i][ii] += x[index1][index2] * y[j][jj];
                                            }
                                        }
                                    }
                                }
                                return res;
                            default:
                                throw new Error("\nconvolution: fourth argument must be 0, 1 or 2.");
                        }
                    } else {
                        throw new Error("\nconvolution: auto-mapping is not supported, third argument must be scalar.");
                    }
                } else {
                    return [];
                }
            } else {
                return [];
            }
        } else {
            return [];
        }
    } else {
        return [];
    }
}
