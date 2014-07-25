this.std.vMake = function(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    result = [];
    for (var i = 0; i < y; i++) {
        result[i] = x;
    }

    return result;
};
