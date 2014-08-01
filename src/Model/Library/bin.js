function bin(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        if (b > a) {
            return 0;
        } else {
            var factorial = exe.lib.std.factorial;
            return factorial(a) / (factorial(b) * factorial(a - b));
        }
    });
}
