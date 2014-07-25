//This function was taken from keesvanoverveld.com
this.std.vNormSq = function(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var a = 0;
        for (var i in x) {
            if (!(x[i] instanceof Array)) {
                a += x[i] * x[i];
            }
        }
        return a;
    } else {
        return x * x;
    }
};
