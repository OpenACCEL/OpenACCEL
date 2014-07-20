function abs(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_abs = exe.lib.std.abs;
        var error = a.propagateError(std_abs);
        if (error) {
            return error;
        }

        var ans = a.clone();
        ans.value = std_abs(a.value);
        return ans;
    });
}

