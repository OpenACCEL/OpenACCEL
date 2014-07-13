function multiply(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        return a * b;
    });
}

multiply.base = 1;
