//This function was taken from keesvanoverveld.com
this.std.vTranspose = function(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var trueMatrix = false;
        var i;

        for (i in x) {
            if (x[i] instanceof Array)
                trueMatrix = true;
        }
        if (trueMatrix) {
            var r = [];
            var j;
            for (i in x) {
                if (x[i] instanceof Array) {
                    for (j in x[i]) {
                        if (r[j] === undefined) {
                            r[j] = [];
                        }
                        r[j][i] = x[i][j];
                    }
                } else {
                    if (r[j] === undefined) {
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
};
