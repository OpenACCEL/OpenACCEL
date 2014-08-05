function abs(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        var std_abs = exe.lib.std.abs;
        var error = UnitObject.prototype.propagateError(std_abs, a);
        if (error) {
            return error;
        }

        return a.clone(std_abs(a.value));
    });
}
