function vExtend(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    x = objectToArray(x);
    y = objectToArray(y);
    if (!(x instanceof Array)) {
        if (y instanceof Array) {
            var p = [];
            p.push(x);
            for (k in y) {
                if (!isNaN(k)) {
                    p.push(y[k]);
                } else {
                    p[k] = y[k];
                }
            }
            return p;
        } else {
            return [x, y];
        }
    } else {
        var p = [];
        for (k in x) {
            p[k] = x[k];
        }
        if (y instanceof Array) {
            for (k in y) {
                if (!isNaN(k)) {
                    p.push(y[k]);
                } else {
                    p[k] = y[k];
                }
            }
        } else {
            p.push(y);
        }
        return p;
    }
}

vExtend.base = []
