function vConcat(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var p = [];
    var k;
    if (!(x instanceof Array)) {
        p.push(x);
    } else {
        for (k in x) {
            p.push(x[k]);
        }
    }
    if (!(y instanceof Array)) {
        p.push(y);
    } else {
        for (k in y) {
            p.push(y[k]);
        }
    }
    return p;
}

vConcat.base = [];
