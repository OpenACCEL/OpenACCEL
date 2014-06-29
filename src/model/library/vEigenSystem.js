function vEigenSystem(x) {
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
            var aEig = Matrix.eigenstructure(aA);
            // aEig.lr=the vector of real parts of the eigenvalues
            // aEig.li=the vector of imaginary parts of eigenvalues
            // eEig.V=matrix of eigenvectors
            var ttt = [];
            // first lr
            ttt[0] = [];
            for (i = 0; i < aEig.lr.length; i++) {
                ttt[0][i] = aEig.lr[i];
            }
            // next li
            ttt[1] = [];
            for (i = 0; i < aEig.li.length; i++) {
                ttt[1][i] = aEig.li[i];
            }
            // next V
            ttt[2] = [];
            for (i = 0; i < aEig.V.mat.length; i++) {
                var vvv = [];
                ttt[2][i] = [];
                for (var j = 0; j < aEig.V.mat[i].length; j++) {
                    vvv[j] = aEig.V.mat[i][j];
                }
                ttt[2][i] = vvv;
            }
            return ttt;
        } else {
            throw new Error("\nvEigenSystem: cannot calculate eigensystem for non-square matrix");
        }
    } else {
        return
        // if x is a scalar, the real part of the eigenvalue is equal to that scalar;
        // the iumaginary part is 0, and the eigenvector is the vector [1]
        [x, 0, [1]];
    }
}
