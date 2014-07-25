this.std.not = function(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return this.libraries.std.unaryZip(x, function(a) {
        return !a;
    });
};
