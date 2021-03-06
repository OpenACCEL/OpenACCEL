function ceil(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        var std_ceil = exe.lib.std.ceil;
        var error = UnitObject.prototype.propagateError(std_ceil, a);
        if (error) {
            return error;
        }

        return a.clone(std_ceil(a.value));
    });
}
