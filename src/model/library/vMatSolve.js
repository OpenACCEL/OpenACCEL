function vMatSolve(mm, v) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    var isOK = true;
    mm = objectToArray(mm);
    if (mm instanceof Array) {
        var t = [];
        var u = [];
        // n is number of rows; m is number of columns of the matrix (=mm)
        var n = mm.length;
        if (mm[0] instanceof Array) {
            var m = mm[0].length;
            if (v instanceof Array) {
                if (m <= n && v.length == n) {
                    for (i = 0; i < n; i++) {
                        t[i] = [];
                        if (mm[i] instanceof Array) {
                            if (mm[i].length == m) {
                                for (j = 0; j < m; j++) {
                                    if (!(mm[i][j] instanceof Array)) {
                                        t[i][j] = mm[i][j];
                                    } else {
                                        throw new Error("\nvMatSolve: every matrix element must be scalar");
                                    }
                                }
                            } else {
                                throw new Error("\nvMatSolve: every row in left hand side must be of equal length");
                            }
                        } else {
                            throw new Error("\nvMatSolve: every row in left hand side must be a vector");
                        }
                    }
                    // next assemble the right hand vector
                    for (i = 0; i < n; i++) {
                        if (!(v[i] instanceof Array)) {
                            u[i] = [];
                            u[i][0] = v[i];
                        } else {
                            throw new Error("\nvMatSolve: non-scalar element found in right-hand side");
                        }
                    }
                } else {
                    throw new Error("\nvMatSolve: nr. rows of right hand side must be equal to nr. columns of left hand side, and the number of rows of the matrix must not be smaller than the number of columns");
                }
            } else {
                throw new Error("\nvMatSolve: right hand side must be vector");
            }
        } else {
            throw new Error("\nvMatSolve: left hand side must be vector of vectors");
        }
    } else {
        throw new Error("\nvMatSolve: first argument must be vector");
    }
    if (isOK) {
        var aA = Matrix.create(t);
        var aB = Matrix.create(u);
        var aSol = Matrix.solve(aA, aB);
        var tt = [];
        for (i = 0; i < aSol.mat.length; i++) {
            tt[i] = aSol.mat[i][0];
        }
        return tt
    }
}
