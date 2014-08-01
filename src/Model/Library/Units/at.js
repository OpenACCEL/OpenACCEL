function at(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + '@' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return exe.lib.std.at(x, unaryZip(y, function(a) {
        if (a instanceof UnitObject) {
            return a.value;
        } else {
            return a;
        }
    }));
}
