function at(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + '@' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (y instanceof Array) {
        // Recursive step, y is an array
        var result = [];
        for (var key in y) {
            result[key] = at(x, y[key]);
        }
        return result;
    } else {
        if (!isNaN(y)) {
            y = Math.round(y);
        }
        // Base: y is a scalar
        if (x instanceof Array) {
            if (x[y] === undefined) {
                return [];
            } else {
                return x[y];
            }
        } else {
            //If x is scalar we simply use x instead of x[y]
            return x;
        }
    }
}
