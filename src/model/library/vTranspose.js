//This function was taken from keesvanoverveld.com
function vTranspose(x) {
    x = __objectToArray__(x);
    if (x instanceof Array) {
        var trueMatrix = false;
        for (i in x) {
            if (x[i] instanceof Array)
                trueMatrix = true;
        }
        if (trueMatrix) {
            var r = [];
            for (i in x) {
                if (x[i] instanceof Array) {
                    for (j in x[i]) {
                        if (r[j] == undefined) {
                            r[j] = [];
                        }
                        r[j][i] = x[i][j];
                    }
                } else {
                    if (r[j] == undefined) {
                        r[j] = [];
                    }
                    r[j][0] = x[i];
                }
            }
            return r;
        } else {
            // x is a vector, but not a matrix. Tow options:
            // consider the argument as [[1,2,3]] and return [[1],[2],[3]] - or consider it just as a list [1,2,3]  and merely return [1,2,3]. We prefer the latter.
            return x;
        }
    } else {
        return x;
    }
}