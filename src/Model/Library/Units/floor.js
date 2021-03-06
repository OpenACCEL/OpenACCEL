function floor(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        var std_floor = exe.lib.std.floor;
        var error = UnitObject.prototype.propagateError(std_floor, a);
        if (error) {
            return error;
        }

        return a.clone(std_floor(a.value));
    });
}