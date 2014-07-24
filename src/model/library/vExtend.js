function vExtend(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var k;
    var p = [];
    if (!(x instanceof Array)) {
        if (y instanceof Array) {
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

vExtend.base = [];
