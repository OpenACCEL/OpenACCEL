function vMatInverse(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        var t = [];
        var n = x.length;
        var isOK = true;
        for (i = 0; i < n; i++) {
            t[i] = [];
            if (x[i] instanceof Array) {
                if (x[i].length == n) {
                    for (j = 0; j < n; j++) {
                        if (!(x[i][j] instanceof Array)) {
                            t[i][j] = x[i][j];
                        } else {
                            isOK = false;
                        }
                    }
                } else {
                    isOK = false;
                }
            } else {
                isOK = false;
            }
        }
        if (isOK) {
            var aA = Matrix.create(t);
            var aInv = Matrix.inverse(aA);
            for (i = 0; i < aInv.mat.length; i++) {
                var tt = [];
                for (j = 0; j < aInv.mat[i].length; j++) {
                    tt[j] = aInv.mat[i][j];
                }
                t[i] = tt;
            }
            return t;
        } else {
            throw new Error("\nvMatInverse: cannot take inverse of non-square matrix");
        }
    } else {
        return 1 / x;
    }
}
