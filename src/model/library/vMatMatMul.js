//This function was taken from keesvanoverveld.com
function vMatMatMul(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    x = objectToArray(x);
    y = objectToArray(y);
    if (x instanceof Array) {
        var trueMatrix0 = false;
        for (i in x) {
            if (x[i] instanceof Array) {
                trueMatrix0 = true;
            }
        }
        if (trueMatrix0) {
            if (y instanceof Array) {
                var trueMatrix1 = false;
                for (j in y) {
                    if (y[j] instanceof Array)
                        trueMatrix1 = true;
                }
                if (trueMatrix1) {
                    var m = [];
                    for (i in x) {
                        var r = [];
                        for (j in y) {
                            if (y[j] instanceof Array) {
                                for (k in y[j]) {
                                    if (x[i][j] != undefined) {
                                        if (y[j][k] != undefined) {
                                            if (!(x[i][j] instanceof Array) && !(y[j][k] instanceof Array)) {
                                                var t = x[i][j] * y[j][k];
                                                if (r[k]) {
                                                    r[k] += t;
                                                } else {
                                                    r[k] = t;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        m[i] = r;
                    }
                    return m;
                } else {
                    // y is not a matrix but a vector; x is a true matrix. So this is a matrix-vector product or a matrix-scalar product.
                    var r = [];
                    for (i in x) {
                        var a = 0;
                        if (x[i] instanceof Array) {
                            for (j in x[i]) {
                                if (y[j] != undefined) {
                                    if (!(x[i][j] instanceof Array) && !(y[j] instanceof Array)) {
                                        a += x[i][j] * y[j];
                                    }
                                }
                            }
                            r[i] = a;
                        }
                    }
                    return r;
                }
            } else {
                // x is a matrix and y is a scalar. Return the matrix, multiplied by the scalar (this would
                // also be achieved by auto mapping the multiplication)
                var m = [];
                for (var i in x) {
                    var r = [];
                    if (x[i] instanceof Array) {
                        for (j in x[i]) {
                            if (!(x[i][j] instanceof Array)) {
                                r[j] = x[i][j] * y;
                            }
                        }
                        m[i] = r;
                    }
                }
                return m;
            }
        } else {
            // the argument x is a vector of scalars, not a true matrix. Perhaps y is a matrix.
            if (y instanceof Array) {
                var trueMatrix1 = false;
                for (j in y) {
                    if (y[j] instanceof Array)
                        trueMatrix1 = true;
                }
                if (trueMatrix1) {
                    // yes, so we do a matrix-vector product
                    var r = [];
                    for (i in x) {
                        if (y[i] != undefined) {
                            if (y[i] instanceof Array) {
                                for (j in y[i]) {
                                    if (!(y[i][j] instanceof Array)) {
                                        if (r[j] != undefined) {
                                            r[j] += x[i] * y[i][j];
                                        } else {
                                            r[j] = x[i] * y[i][j];
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return r;
                } else {
                    // y is not a matrix but a vector; x is also a vector. So we calculate the dot product -
                    // treating the vector y as a column rather than as the row that it actually is..
                    var a = 0;
                    for (i in x) {
                        if (y[i] != undefined) {
                            if (!(y[i] instanceof Array)) {
                                a += x[i] * y[i];
                            }
                        }
                    }
                    // what should we do - return this as a number or as a 1x1 matrix? Choose to return it as a number.
                    return a;
                }
            } else {
                // so x is a vector and y is a scalar.
                var r = [];
                for (i in x) {
                    if (!(x[i] instanceof Array)) {
                        r[i] = x[i] * y;
                    }
                }
                return r;
            }
        }
    } else {
        // x is a scalar. Perhaps y is a matrix.
        if (y instanceof Array) {
            var trueMatrix1 = false;
            for (i in y) {
                if (y[i] instanceof Array)
                    trueMatrix1 = true;
            }
            if (trueMatrix1) {
                // so x is a scalar and y is a matrix.
                var m = [];
                for (i in y) {
                    var r = [];
                    if (y[i] instanceof Array) {
                        for (j in y[i]) {
                            if (!(y[i][j] instanceof Array)) {
                                r[j] = y[i][j] * x;
                            }
                        }
                        m[i] = r;
                    }
                }
                return m;
            } else {
                // x is a scalar and y is a vector.
                var r = [];
                for (i in y) {
                    if (!(y[i] instanceof Array)) {
                        r[i] = y[i] * x;
                    }
                }
                return r;
            }
        } else {
            // x is a scalar and y is a scalar: just return their product
            return x * y;
        }
    }
}
