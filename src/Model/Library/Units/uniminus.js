function uniminus(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        var std_uniminus = exe.lib.std.uniminus;
        var error = UnitObject.prototype.propagateError(std_uniminus, a);
        if (error) {
            return error;
        }

        return a.clone(std_uniminus(a.value));
    });
}
